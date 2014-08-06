var path = require('path');
var fs = require('fs');
var pseudo = require('enb-bem-pseudo-levels');
var builder = require('./builder');

module.exports = function (taskConfigutator) {
    return {
        configure: function (options) {
            this._buildPseudoLevels(options);
            this._copySymlinks(options);
        },

        _buildPseudoLevels: function (options) {
            var config = taskConfigutator.getConfig();
            var root = config._rootPath;
            var dstpath = path.resolve(root, options.destPath);
            var resolve = builder({
                techSuffixes: options.techSuffixes,
                fileSuffixes: options.fileSuffixes
            });

            taskConfigutator.prebuild(function (buildConfig) {
                var dstargs = buildConfig._args.map(function (arg) {
                    return path.resolve(root, arg);
                });

                return pseudo(options.levels)
                    .addBuilder(dstpath, resolve)
                    .build(dstargs)
                    .then(function (filenames) {
                        filenames.forEach(function (filename) {
                            var node = path.dirname(path.relative(root, filename));

                            buildConfig.addNode(node);
                        });
                    });
            });
        },

        _copySymlinks: function (options) {
            var config = taskConfigutator.getConfig();
            var pattern = path.join(options.destPath, '*', '*');

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
