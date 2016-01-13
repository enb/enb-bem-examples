var path = require('path'),
    SUBLEVEL_NAME = 'blocks',
    SYMLINK_EXT = '.symlink';

/**
 * Создаёт resolve-функцию псевдоуровней.
 *
 * Используется для построения уровня-сета с бандлами примеров на основе папок-технологий, представляющих собой
 * simple-уровни с бандлами примеров.
 *
 * Пример:
 *
 * <block-name>.examples/
 *  ├── blocks/                   # уровень для всех примеров блока <block-name>
 *  ├── 10-simple.blocks/         # уровень для примера 10-simple
 *  ├── 10-simple.bemjson.js
 *  ├── 10-simple.title.txt
 *  ├── 20-complex.bemjson.js
 *  └── 20-complex.title.txt
 *
 * В результирующий уровень-сет будут предоставлены только те файлы, суффиксы которых содержатся в `fileSuffixes` опции,
 * а так же, если файлы находятся внутри папок-технологий, суффиксы которых содержатся в `techSuffixes` опции.
 *
 * Если для примера встретится уровень, то он будет предоставлен в бандл этого примера с именем `blocks`. Если же
 * встретится уровень для всех примеров, то он будет предоставлен в уровень-сет с именем `.blocks`.
 *
 * Все файлы в уровне-сете представлены как симлинки с расширением `.symlink`.
 *
 * Пример:
 *
 * <set-name>.examples
 *  └── <block-name>/
 *       ├── 10-simple/
 *           ├── <block-name>.blocks/    # уровень для всех примеров блока <block-name>
 *           ├── 10-simple.blocks/       # уровень для примера 10-simple
 *           └── 10-simple.bemjson.js.symlink
 *       └── 20-complex/
 *           ├── <block-name>.blocks/    # уровень для всех примеров блока <block-name>
 *           └── 20-comples.bemjson.js.symlink
 *
 * @param {Object} options
 * @param {Array<String>} options.techSuffixes Суффиксы папок-технологий с примерами.
 * @param {Array<String>} options.fileSuffixes Суффиксы файлов внутри папок-технологий с примерами.
 * @return {Function}
 */
module.exports = function (options) {
    return function (dir) {
        if (!dir.isDirectory || options.techSuffixes.indexOf(dir.suffix) === -1) {
            return;
        }

        var files = [],
            commonSublevel; // Уровень для всех примеров

        (dir.files || []).forEach(function (file) {
            if (file.name === SUBLEVEL_NAME) {
                commonSublevel = file;
                return;
            }

            files.push(file);
        });

        var scope = getPrefix(dir.name),
            res = [];

        files.forEach(function (file) {
            var basename = file.name,
                bemname = getPrefix(basename),
                suffix = file.suffix,
                shouldBeAdded = options.fileSuffixes.indexOf(suffix) !== -1;

            if (suffix === SUBLEVEL_NAME) { // Уровень только для текущего примера
                basename = bemname + '.blocks';
                shouldBeAdded = true;
            }

            var examplePath = path.join(scope, bemname);

            shouldBeAdded && res.push({
                targetPath: path.join(examplePath, file.isDirectory ? basename : basename + SYMLINK_EXT),
                sourcePath: file.fullname,
                isDirectory: file.isDirectory
            });

            shouldBeAdded && commonSublevel && res.push({
                targetPath: path.join(examplePath, scope + '.blocks'),
                sourcePath: commonSublevel.fullname,
                isDirectory: true
            });
        });

        return res;
    };
};

/**
 * @param {String} filename
 * @returns {String}
 */
function getPrefix(filename) {
    return filename.split('.')[0];
}
