var plugin = require('./plugin');

/**
 * Модуль для создания конфигураторов уровней-сетов из примеров БЭМ-блоков.
 *
 * @name ExampleSetModule
 * @param {ProjectConfig} config
 * @constructor
 */
var ExampleSetModule = function (config) {
    this._config = config;

    config.includeConfig('enb-bem-sets');
};

/**
 * Создаёт конфигуратор уровней-сетов из примеров БЭМ-блоков.
 *
 * @param {String} taskName
 * @returns {Object}
 */
ExampleSetModule.prototype.createConfigurator = function (taskName) {
    var sets = this._config.module('enb-bem-sets');

    return plugin(sets.createConfigurator(taskName));
};

/**
 * Регистрирует модуль.
 *
 * @param {ProjectConfig} config
 */
module.exports = function (config) {
    config.registerModule('enb-bem-examples', new ExampleSetModule(config));
};
