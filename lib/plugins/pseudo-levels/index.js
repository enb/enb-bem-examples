var path = require('path');
var fs = require('fs');
var naming = require('bem-naming');
var pseudo = require('enb-bem-pseudo-levels');
var builder = require('./builder');

/**
 * Возвращает конфигуратор уровня-сетов из примеров БЭМ-блоков с помощью `MagicHelper`.
 * Умеет собирать примеры по папкам-технологиям (simple-уровням).
 *
 * @param {MagicHelper} helper
 * @returns {{configure: Function}}
 */
module.exports = function (helper) {
    return {
        /**
         * Настраивает сборку псевдоуровеня-сета. В процессе сборки вначале будут созданы симлинки на все нужные файлы
         * и директории, а за тем нужные файлы будут скопированы из оригинальных исходных файлов.
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
            var config = helper.getProjectConfig();
            var channel = helper.getEventChannel();
            var root = config.getRootPath();
            var dstpath = path.resolve(root, options.destPath);
            var resolve = builder({
                techSuffixes: options.techSuffixes,
                fileSuffixes: options.fileSuffixes
            });

            helper.prebuild(function (magic) {
                // Получаем абсолютные пути таргетов, которые нужно построить
                var dstargs = magic.getRequiredTargets().map(function (arg) {
                    var target = path.basename(arg).indexOf('.') !== -1 ? arg + '.symlink' : arg;

                    return path.resolve(root, target);
                });

                // Строим псевдоуровень
                return pseudo(options.levels)
                    .addBuilder(dstpath, resolve)
                    .build(dstargs)
                    .then(function (filenames) {
                        var nodes = {};

                        // Регистрируем новые ноды и таргеты в рамках построенного псевдоуровня
                        filenames.forEach(function (filename) {
                            var node = path.dirname(path.relative(root, filename));
                            var basename = path.basename(node);

                            if (magic.isRequiredNode(node)) {
                                nodes[node] = true;

                                if (options.fileSuffixes.length) {
                                    // Регистрируем созданные файлы как таргеты
                                    options.fileSuffixes.forEach(function (suffix) {
                                        magic.registerTarget(path.join(node, basename + '.' + suffix));
                                    });
                                } else {
                                    magic.registerNode(node);
                                }
                            }
                        });

                        // Сообщаем о созданных примерах
                        var examples = Object.keys(nodes).map(function (node) {
                            var basename = path.basename(node);

                            return {
                                name: basename,
                                path: node,
                                notation: naming.parse(basename)
                            };
                        });

                        channel.emit('examples', options.destPath, examples);
                    });
            });
        },

        _copySymlinks: function (options) {
            var config = helper.getProjectConfig();
            var pattern = path.join(options.destPath, '*', '*');

            config.nodes(pattern, function (nodeConfig) {
                var node = path.basename(nodeConfig.getNodePath());

                options.fileSuffixes.forEach(function (suffix) {
                    var target = node + '.' + suffix;
                    var symlinkTarget = target + '.symlink';
                    var symlinkFilename = nodeConfig.resolvePath(symlinkTarget);

                    // Проверяем нужно ли копировать файл по симлинке
                    if (fs.existsSync(symlinkFilename)) {
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
