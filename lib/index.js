var plugin = require('./plugin');

var ExampleSetsModule = function (config) {
    this._config = config;

    config.includeConfig('enb-bem-sets');
};

ExampleSetsModule.prototype.createConfigurator = function (taskName, deps) {
    var sets = this._config.module('enb-bem-sets');

    return plugin(sets.createConfigurator(taskName, deps));
};

module.exports = function (config) {
    config.registerModule('enb-bem-examples', new ExampleSetsModule(config));
};
