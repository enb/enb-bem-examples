var path = require('path'),
    fs = require('fs'),
    naming = require('bem-naming'),
    pseudo = require('enb-bem-pseudo-levels'),
    builder = require('./builder');

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
            this._prebuild(options);
            this._postconfig(options);
        },

        _prebuild: function (options) {
            helper.prebuild(function (magic) {
                var root = helper.getRootPath(),
                    requiredTargets = magic.getRequiredTargets(),
                    channel = helper.getEventChannel();

                // Строим псевдоуровень
                return buildPseudoLevel(root, requiredTargets, options)
                    .then(function (filenames) {
                        // Регистрируем новые ноды построенного псевдоуровня
                        var destPath = options.destPath,
                            nodes = registerNodes(magic, root, destPath, filenames);

                        // Сообщаем о созданных примерах
                        emitExamples(channel, destPath, nodes);
                    });
            });
        },

        _postconfig: function (options) {
            helper.configure(function (config, registeredNodes, registeredTargets) {
                var nodes = getNodesToBuild(options.destPath, registeredNodes, registeredTargets);

                config.nodes(nodes, function (nodeConfig) {
                    var node = path.basename(nodeConfig.getNodePath());

                    options.fileSuffixes.forEach(function (suffix) {
                        var target = node + '.' + suffix,
                            symlinkTarget = target + '.symlink',
                            symlinkFilename = nodeConfig.resolvePath(symlinkTarget);

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
            });
        }
    };
};

function buildPseudoLevel(root, requiredTargets, options) {
    var dstpath = path.resolve(root, options.destPath),
        resolve = builder({
            techSuffixes: options.techSuffixes,
            fileSuffixes: options.fileSuffixes
        }),
        symlinks = getSymlinks(root, requiredTargets, options.fileSuffixes);

    return pseudo(options.levels)
        .addBuilder(dstpath, resolve)
        .build(symlinks);
}

function getSymlinks(root, requiredTargets, fileSuffixes) {
    var symlinks = {};

    requiredTargets.forEach(function (arg) {
        var splitedArg = arg.split(path.sep),
            l = splitedArg.length,
            targetSuffix = splitedArg[l - 1].split('.').slice(1).join('.'),
            symlink = l <= 3 ?
                path.resolve(root, arg) :
                (fileSuffixes.some(function (suffix) { return targetSuffix === suffix; })) ?
                    path.resolve(root, arg + '.symlink') :
                    path.resolve(root, path.dirname(arg));

        symlinks[symlink] = true;
    });

    return Object.keys(symlinks);
}

function registerNodes(magic, root, destPath, filenames) {
    var nodes = {};

    filenames.forEach(function (filename) {
        var node = path.relative(root, path.dirname(filename)),
            nodeDepth = node.split(path.sep).length,
            destDepth = destPath.split(path.sep).length,
            depth = nodeDepth - destDepth;

        if (depth === 2 && magic.isRequiredNode(node)) {
            nodes[node] = true;

            magic.registerNode(node);
        }
    });

    return Object.keys(nodes);
}

function emitExamples(channel, dstpath, nodes) {
    var examples = nodes.map(function (node) {
        var basename = path.basename(node);

        return {
            name: basename,
            path: node,
            notation: naming.parse(basename)
        };
    });

    channel.emit('examples', dstpath, examples);

    return examples;
}

function getNodesToBuild(dstpath, nodes, targets) {
    var targetNodes = {};

    targets && targets.length && targets.forEach(function (target) {
        targetNodes[path.dirname(target)] = true;
    });

    return [].concat(nodes, Object.keys(targetNodes)).filter(function (node) {
        return node.indexOf(dstpath) === 0;
    });
}
