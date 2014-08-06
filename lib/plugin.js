var pseudoLevelsPlugin = require('./plugins/pseudo-levels');
var inlineBemjsonPlugin = require('./plugins/inline-bemjson');

module.exports = function (taskConfigutator) {
    var pseudoConfigurator = pseudoLevelsPlugin(taskConfigutator);
    var inlineConfigurator = inlineBemjsonPlugin(taskConfigutator);

    return {
        configure: function (options) {
            options || (options = {});
            options.techSuffixes || (options.techSuffixes = ['examples']);
            options.fileSuffixes || (options.fileSuffixes = ['bemjson.js']);

            pseudoConfigurator.configure(options);

            if (options.inlineBemjson) {
                options.processInlineBemjson || (options.processInlineBemjson = function (bemjson) {
                    return bemjson;
                });

                inlineConfigurator.configure(options);
            }
        }
    };
};
