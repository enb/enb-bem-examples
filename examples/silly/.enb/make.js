var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var exampleSets = require(rootPath);

module.exports = function (config) {
    var examples = exampleSets.create('examples', config);

    examples.build({
        destPath: 'examples',
        levels: getLevels(config),
        suffixes: ['examples']
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
