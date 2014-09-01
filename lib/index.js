var plugin = require('./plugin');

/**
 * Модуль для создания конфигураторов уровней-сетов из примеров БЭМ-блоков.
 *
 * @name ExampleSets
 * @param {ProjectConfig} config
 * @constructor
 */
function ExampleSets(config) {
    this._config = config;

    config.includeConfig(require.resolve('enb-magic-factory'));
}

/**
 * Создаёт конфигуратор уровней-сетов из примеров БЭМ-блоков.
 *
 * @param {String} taskName
 * @returns {Object}
 */
ExampleSets.prototype.createConfigurator = function (taskName) {
    var factory = this._config.module('enb-magic-factory');

    return plugin(factory.createHelper(taskName));
};

/**
 * Регистрирует модуль.
 *
 * @param {ProjectConfig} config
 */
module.exports = function (config) {
    config.registerModule('enb-bem-examples', new ExampleSets(config));
};
