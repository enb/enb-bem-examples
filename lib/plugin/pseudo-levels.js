var path = require('path');
var pseudo = require('enb-bem-pseudo-levels');
var builder = require('../builder');

module.exports = function (taskConfigutator) {
    return {
        configure: function (options) {
            var config = taskConfigutator.getConfig();
            var root = config._rootPath;
            var dstpath = path.resolve(root, options.destPath);

            taskConfigutator.prebuild(function (buildConfig, args) {
                var dstargs = args.map(function (arg) {
                    return path.resolve(root, arg);
                });

                return pseudo(options.levels)
                    .addBuilder(dstpath, builder({ suffixes: options.suffixes || ['examples'] }))
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
        }
    };
};
