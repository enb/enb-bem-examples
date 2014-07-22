var path = require('path');
var fs = require('fs');

module.exports = function (taskConfigutator) {
    return {
        configure: function (options) {
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
