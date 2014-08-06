var path = require('path');
var fs = require('fs');
var pseudo = require('enb-bem-pseudo-levels');
var builder = require('../builder');

module.exports = function (taskConfigutator) {
    return {
        configure: function (options) {
            var config = taskConfigutator.getConfig();
            var pattern = path.join(options.destPath, '*', '*');
            var root = config._rootPath;
            var dstpath = path.resolve(root, options.destPath);

            taskConfigutator.prebuild(function (buildConfig) {
                var dstargs = buildConfig._args.map(function (arg) {
                    return path.resolve(root, arg);
                });

                return pseudo(options.levels)
                    .addBuilder(dstpath, builder({
                        techSuffixes: options.techSuffixes,
                        fileSuffixes: options.fileSuffixes
                    }))
                    .build(dstargs)
                    .then(function (filenames) {
                        var targets = filenames.map(function (filename) {
                            return path.relative(root, filename);
                        });

                        targets.forEach(function (target) {
                            var basename = path.basename(target);

                            if (basename !== '.blocks') {
                                buildConfig.addNode(path.dirname(target));
                            }
                        });
                    });
            });

            config.nodes(pattern, function (nodeConfig) {
                var nodename = path.basename(nodeConfig.getNodePath());

                options.fileSuffixes.forEach(function (suffix) {
                    var target = nodename + '.' + suffix;
                    var symlinkTarget = target + '.symlink';
                    var filename = nodeConfig.resolvePath(target);
                    var symlinkFilename = nodeConfig.resolvePath(symlinkTarget);

                    if (!fs.existsSync(filename) && fs.existsSync(symlinkFilename)) {
                        nodeConfig.addTechs([
                            [require('enb/techs/file-provider'), { target: symlinkTarget }],
                            [require('enb/techs/file-copy'), {
                                source: symlinkTarget,
                                target: target
                            }]
                        ]);
                        nodeConfig.addTarget(target);
                    }
                });
            });
        }
    };
};
