var path = require('path');
var crypto = require('crypto');
var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var builder = require('./builder');
var scanner = require('enb-pseudo-levels/lib/level-scanner');
var BEMJSON_CODE_REGEX = /`{3}bemjson\n([^`]*)\n`{3}/gi;

module.exports = function (maker) {
    return {
        build: function (options) {
            var config = maker._config;
            var pattern = path.join(options.destPath, '*', '*');
            var cdir = config._rootPath;
            var destDir = path.join(cdir, options.destPath);

            config.nodes(pattern, function () {});

            return maker.build(builder(options), options)
                .then(function (targets) {
                    var levels = options.levels.map(function (level) {
                        return (typeof level === 'string') ? { path: level } : level;
                    });

                    return scanner.scan(levels)
                        .then(function (files) {
                            var mdFiles = files.filter(function (file) {
                                var ext = path.extname(file.fullname);

                                return ext === '.md';
                            });

                            return vow.all(mdFiles.map(function (file) {
                                return vfs.read(file.fullname, 'utf-8')
                                    .then(function (source) {
                                        var matched = source.match(BEMJSON_CODE_REGEX);

                                        return vow.all(matched.map(function (str) {
                                            var code = str.split('\n').slice(1);

                                            code.pop();
                                            code = code.join('\n');

                                            var shasum = crypto.createHash('sha1'); shasum.update(code);
                                            var base64 = fixBase64(shasum.digest('base64'));
                                            var nodePath = path.join(destDir, base64);
                                            var exampleFilename = path.join(nodePath, base64 + '.bemjson.js');

                                            targets.push(exampleFilename);

                                            return vfs.makeDir(nodePath)
                                                .then(function () {
                                                    return vfs.write(exampleFilename, code, 'utf-8');
                                                });
                                        }));
                                    });
                            }));
                        })
                        .then(function () {
                            return targets;
                        });
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
