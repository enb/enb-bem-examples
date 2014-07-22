var nodesPlugin = require('./plugin/nodes');
var pseudoLevelsPlugin = require('./plugin/pseudo-levels');
var inlineBemjsonPlugin = require('./plugin/inline-bemjson');

module.exports = function (taskConfigutator) {
    var nodeConfigurators = nodesPlugin(taskConfigutator);
    var pseudoConfigurators = pseudoLevelsPlugin(taskConfigutator);
    var inlineConfigurators = inlineBemjsonPlugin(taskConfigutator);

    return {
        configure: function (options) {
            pseudoConfigurators.configure(options);
            nodeConfigurators.configure(options);
            inlineConfigurators.configure(options);
        }
    };
};
