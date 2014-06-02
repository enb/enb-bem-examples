var path = require('path');
var builder = require('./builder');

module.exports = function (maker) {
    return {
        build: function (options) {
            var config = maker._config;
            var pattern = path.join(options.destPath, '*', '*');

            config.nodes(pattern, function () {});

            return maker.build(builder(options), options);
        }
    };
};
