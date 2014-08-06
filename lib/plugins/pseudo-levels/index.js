var path = require('path');
var fs = require('fs');
var pseudo = require('enb-bem-pseudo-levels');
var builder = require('./builder');

/**
 * Возвращает конфигуратор уровня-сетов из примеров БЭМ-блоков с помощью `TaskConfigurator`.
 * Умеет собирать примеры по папкам-технологиям (simple-уровням).
 *
 * @param {TaskConfigurator} taskConfigurator
 * @returns {{configure: Function}}
 */
module.exports = function (taskConfigutator) {
    return {
        /**
         * Настраивает сборку псевдоуровеня-сета из симлинок,
         * а так же копирование файлов в нодах, полученных после сборки псевдоуровня-сета, по симлинкам.
         *
         * @param {Object}   options
         * @param {String}   options.destPath       Путь до нового уровня-сета относительный корня.
         * @param {Array}    options.levels         Уровни в которых следует искать примеры.
         * @param {String[]} [options.techSuffixes] Суффиксы папок-технологий с примерами.
         * @param {String[]} [options.fileSuffixes] Суффиксы файлов внутри папок-технологий с примерами.
         */
        configure: function (options) {
            this._buildPseudoLevels(options);
            this._copySymlinks(options);
        },

        _buildPseudoLevels: function (options) {
            var config = taskConfigutator.getConfig();
            var root = config._rootPath;
            var dstpath = path.resolve(root, options.destPath);
            var resolve = builder({
                techSuffixes: options.techSuffixes,
                fileSuffixes: options.fileSuffixes
            });

            taskConfigutator.prebuild(function (buildConfig) {
                // Получаем абсолютные пути таргетов, которые нужно построить
                var dstargs = buildConfig._args.map(function (arg) {
                    return path.resolve(root, arg);
                });

                // Строим псевдоуровень
                return pseudo(options.levels)
                    .addBuilder(dstpath, resolve)
                    .build(dstargs)
                    .then(function (filenames) {
                        // Регистрируем новые ноды в рамках построенного псевдоуровня
                        filenames.forEach(function (filename) {
                            var node = path.dirname(path.relative(root, filename));

                            buildConfig.addNode(node);
                        });
                    });
            });
        },

        _copySymlinks: function (options) {
            var config = taskConfigutator.getConfig();
            var pattern = path.join(options.destPath, '*', '*');

            config.nodes(pattern, function (nodeConfig) {
                var nodename = path.basename(nodeConfig.getNodePath());

                options.fileSuffixes.forEach(function (suffix) {
                    var target = nodename + '.' + suffix;
                    var symlinkTarget = target + '.symlink';
                    var filename = nodeConfig.resolvePath(target);
                    var symlinkFilename = nodeConfig.resolvePath(symlinkTarget);

                    // Проверяем нужно ли копировать файл по симлинке
                    if (!fs.existsSync(filename) && fs.existsSync(symlinkFilename)) {
                        nodeConfig.addTechs([
                            [require('enb/techs/file-provider'), { target: symlinkTarget }],
                            [require('enb/techs/file-copy'), {
                                source: symlinkTarget,
                                target: target
                            }]
                        ]);
                        nodeConfig.addTarget(target);
                    }
                });
            });
        }
    };
};
