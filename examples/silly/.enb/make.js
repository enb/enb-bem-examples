var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    config.includeConfig(rootPath);

    var examples = config.module('enb-bem-examples').createConfigurator('examples');

    examples.build({
        destPath: 'examples',
        levels: getLevels(config),
        suffixes: ['examples'],
        inlineBemjson: true,
        processBemjson: function (bemjson) {
            return bemjson;
        }
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
