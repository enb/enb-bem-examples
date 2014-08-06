var path = require('path');

function one(file, scope) {
    var basename = file.name;
    var bundle = basename.split('.')[0];

    if (basename === 'blocks') {
        basename = '.blocks';
        bundle = '';
    } else if (file.suffix === 'blocks') {
        basename = 'blocks';
    }

    return {
        targetPath: path.join(scope, bundle, file.isDirectory ? basename : basename + '.symlink'),
        sourcePath: file.fullname
    };
}

module.exports = function (options) {
    return function (file) {
        if (file.isDirectory && options.techSuffixes.indexOf(file.suffix) !== -1) {
            var scope = file.name.split('.')[0];
            var files = file.files;

            return files && files.length && files
                .filter(function (file) {
                    return options.fileSuffixes.indexOf(file.suffix) !== -1;
                })
                .map(function (file) {
                    return one(file, scope);
                })
                .filter(function (file) {
                    return file;
                });
        }

        return false;
    };
};
