var pseudoLevelsPlugin = require('./plugins/pseudo-levels');
var inlineBemjsonPlugin = require('./plugins/inline-bemjson');

module.exports = function (taskConfigutator) {
    var pseudoConfigurators = pseudoLevelsPlugin(taskConfigutator);
    var inlineConfigurators = inlineBemjsonPlugin(taskConfigutator);

    return {
        configure: function (options) {
            options || (options = {});

            options.techSuffixes || (options.techSuffixes = ['examples']);
            options.fileSuffixes || (options.fileSuffixes = ['bemjson.js']);
            options.processInlineBemjson || (options.processInlineBemjson = function (bemjson) {
                return bemjson;
            });

            pseudoConfigurators.configure(options);

            if (options.inlineBemjson) {
                inlineConfigurators.configure(options);
            }
        }
    };
};
