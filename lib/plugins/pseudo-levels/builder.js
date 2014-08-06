var path = require('path');
var SUBLEVEL_NAME = 'blocks';
var SYMLINK_EXT = '.symlink';

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

                // Уровень переопределения для всех примеров
                if (basename === SUBLEVEL_NAME) {
                    basename = '.blocks';
                    bemname = '';
                } else
                // Уровень переопределения только для текущего примера
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
