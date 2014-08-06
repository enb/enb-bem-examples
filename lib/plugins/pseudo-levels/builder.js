var path = require('path');
var SUBLEVEL_NAME = 'blocks';
var SYMLINK_EXT = '.symlink';

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
 *       ├── .blocks/             # уровень для всех примеров блока <block-name>
 *       ├── 10-simple/
 *           ├── blocks/          # уровень для примера 10-simple
 *           └── 10-simple.bemjson.js.symlink
 *       └── 20-complex/
 *           └── 20-comples.bemjson.js.symlink
 *
 * @param {Object} options
 * @param {Array<String>} options.techSuffixes Суффиксы папок-технологий с примерами.
 * @param {Array<String>} options.fileSuffixes Суффиксы файлов внутри папок-технологий с примерами.
 * @return {Function}
 */
module.exports = function (options) {
    return function (dir) {
        if (dir.isDirectory && options.techSuffixes.indexOf(dir.suffix) !== -1) {
            var scope = dir.name.split('.')[0];
            var files = dir.files && dir.files.length && dir.files.filter(function (file) {
                return options.fileSuffixes.indexOf(file.suffix) !== -1;
            });

            return files && files.length && files.map(function (file) {
                var basename = file.name;
                var bemname = basename.split('.')[0];

                // Уровень для всех примеров
                if (basename === SUBLEVEL_NAME) {
                    basename = '.blocks';
                    bemname = '';
                } else
                // Уровень только для текущего примера
                if (file.suffix === SUBLEVEL_NAME) {
                    basename = 'blocks';
                }

                return {
                    targetPath: path.join(scope, bemname, file.isDirectory ? basename : basename + SYMLINK_EXT),
                    sourcePath: file.fullname
                };
            });
        }
    };
};
