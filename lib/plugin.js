var path = require('path'),
    pseudoLevelsPlugin = require('./plugins/pseudo-levels'),
    inlineBemjsonPlugin = require('./plugins/inline-bemjson');

/**
 * Возвращает конфигуратор уровня-сетов из примеров БЭМ-блоков с помощью `MagicHelper`.
 * Умеет собирать примеры как по папкам-технологиям (simple-уровням), так и по md-файлам.
 *
 * @param {MagicHelper} helper
 * @returns {{configure: Function}}
 */
module.exports = function (helper) {
    var pseudoConfigurator = pseudoLevelsPlugin(helper),
        inlineConfigurator = inlineBemjsonPlugin(helper);

    return {
        /**
         * Настраивает сборку уровня-сета из бандлов примеров.
         *
         * @param {Object}   options
         * @param {String}   options.destPath               Путь до нового уровня-сета относительный корня.
         * @param {Array}    options.levels                 Уровни в которых следует искать примеры.
         * @param {String[]} [options.techSuffixes]         Суффиксы папок-технологий с примерами.
         * @param {String[]} [options.fileSuffixes]         Суффиксы файлов внутри папок-технологий с примерами.
         * @param {Boolean}  [options.inlineBemjson]        Строить ли инлайновые примеры по md-файлам.
         * @param {Function} [options.processInlineBemjson] Функция обработки инлайнового bemjson.
         */
        configure: function (options) {
            var root = helper.getRootPath();

            options || (options = {});
            options.techSuffixes || (options.techSuffixes = ['examples']);
            options.fileSuffixes || (options.fileSuffixes = ['bemjson.js']);

            // Нормализуем список уровней
            options.levels = options.levels.map(function (levelPath) {
                var level = (typeof levelPath === 'string') ? { path: levelPath } : levelPath;

                level.path = path.resolve(root, level.path);

                return level;
            });

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
