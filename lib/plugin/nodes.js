var path = require('path');
var fs = require('fs');

module.exports = function (taskConfigutator) {
    return {
        configure: function (options) {
            var config = taskConfigutator.getConfig();
            var pattern = path.join(options.destPath, '*', '*');

            config.nodes(pattern, function (nodeConfig) {
                var nodename = path.basename(nodeConfig.getNodePath());
                var filename = nodeConfig.resolvePath(nodename + '.bemjson.js');

                if (!fs.existsSync(filename)) {
                    nodeConfig.addTechs([
                        [require('enb/techs/file-provider'), { target: '?.bemjson.js.symlink' }],
                        [require('enb/techs/file-copy'), {
                            source: '?.bemjson.js.symlink',
                            target: '?.bemjson.js'
                        }]
                    ]);
                    nodeConfig.addTarget('?.bemjson.js');
                }
            });
        }
    };
};
