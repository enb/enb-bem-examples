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
    options || (options = {});

    var suffixes = options.suffixes || ['examples'];

    return function (file) {
        if (file.isDirectory && ~suffixes.indexOf(file.suffix)) {
            var files = file.files;
            var scope = file.name.split('.')[0];

            return files && files.length && files.map(function (file) {
                return one(file, scope);
            }).filter(function (file) {
                return file;
            });
        }

        return false;
    };
};
