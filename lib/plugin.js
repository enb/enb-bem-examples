var path = require('path');
var crypto = require('crypto');
var vm = require('vm');
var naming = require('bem-naming');
var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var pseudo = require('enb-bem-pseudo-levels');
var scanner = require('enb-bem-pseudo-levels/lib/level-scanner');
var builder = require('./builder');
var BEMJSON_CODE_REGEX = /`{3,}bemjson\n([^`]*)\n`{3,}/gi;

module.exports = function (maker) {
    return {
        configure: function (options) {
            var config = maker._config;
            var pattern = path.join(options.destPath, '*', '*');
            var cdir = config._rootPath;
            var destDir = path.join(cdir, options.destPath);
            var processBemjson = options.processBemjson;

            config.nodes(pattern, function () {});

            maker.prebuild(function (buildConfig, args) {
                var promises = [];
                var dstpath = path.resolve(cdir, options.destPath);
                var dstargs = args.map(function (arg) {
                    return path.resolve(cdir, arg);
                });

                promises.push(pseudo(options.levels)
                    .addBuilder(dstpath, builder(options))
                    .build(dstargs)
                    .then(function (filenames) {
                        var targets = filenames.map(function (filename) {
                            return path.relative(cdir, filename);
                        });

                        targets.forEach(function (target) {
                            var basename = path.basename(target);

                            if (basename !== '.blocks') {
                                buildConfig.addNode(path.dirname(target));
                            }
                        });
                    }));

                if (options.inlineBemjson) {
                    promises.push(buildByInlineBemjson(destDir, options.levels, dstargs, processBemjson)
                        .then(function (targets) {
                            targets && targets.length && targets.forEach(function (filename) {
                                var dirname = path.dirname(filename);
                                var node = path.relative(config.getRootPath(), dirname);

                                buildConfig.addNode(node);
                            });
                        }));
                }

                return vow.all(promises);
            });
        }
    };
};

function fixBase64(base64) {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .replace(/^[+-]+/g, '');
}

function needBuildTarget(args, target) {
    var need = false;

    if (args && args.length) {
        args.forEach(function (arg) {
            arg = arg.replace(/\/$/, '');

            var splitedArg = arg.split(path.sep);
            var splitedTarget = target.split(path.sep);

            if (splitedArg.length === splitedTarget.length && target === arg) {
                need = true;
            } else if (splitedArg.length < splitedTarget.length) {
                if (arg === splitedTarget.splice(0, splitedArg.length).join(path.sep)){
                    need = true;
                }
            }
        });
    }

    return true;
}

function processCode(code, meta, process) {
    var bemjson = vm.runInNewContext('(' + code + ')', {});

    return '(' + JSON.stringify(process(bemjson, meta)) + ')';
}

function buildByInlineBemjson(destDir, levels, dstargs, processBemjson) {
    var targets = [];

    processBemjson || (processBemjson = function (bemjson) {
        return bemjson;
    });
    levels = levels.map(function (level) {
        return (typeof level === 'string') ? { path: level } : level;
    });

    return scanner.scan(levels)
        .then(function (files) {
            var mdFiles = files.filter(function (file) {
                var ext = path.extname(file.fullname);

                return ext === '.md';
            });

            return vow.all(mdFiles.map(function (file) {
                var name = file.name.split('.')[0];
                var notation = naming.parse(name);
                var block = notation.block;
                var scopeDir = path.join(destDir, block);

                return vfs.read(file.fullname, 'utf-8')
                    .then(function (source) {
                        var matched = source.match(BEMJSON_CODE_REGEX);

                        return matched && vow.all(matched.map(function (str) {
                            var code = str.split('\n').slice(1);

                            code.pop();
                            code = code.join('\n');

                            var shasum = crypto.createHash('sha1'); shasum.update(code);
                            var base64 = fixBase64(shasum.digest('base64'));
                            var nodePath = path.join(scopeDir, base64);
                            var basename = base64 + '.bemjson.js';
                            var filename = path.join(nodePath, basename);

                            if (needBuildTarget(dstargs, filename)) {
                                var processedCode = processCode(code, {
                                    notation: naming.parse(name),
                                    filename: filename
                                }, processBemjson);

                                targets.push(filename);

                                return vfs.makeDir(nodePath)
                                    .then(function () {
                                        return vfs.write(filename, processedCode, 'utf-8');
                                    });
                            } else {
                                return vow.resolve();
                            }
                        }));
                    });
            }));
        })
        .then(function () {
            return targets;
        });
}
