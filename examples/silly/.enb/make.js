var path = require('path');
var naming = require('bem-naming');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    config.includeConfig(rootPath);

    var examples = config.module('enb-bem-examples').createConfigurator('examples');

    examples.configure({
        destPath: 'set.examples',
        levels: ['blocks'],
        techSuffixes: ['examples'],
        fileSuffixes: ['bemjson.js', 'title.txt'],
        inlineBemjson: true,
        processInlineBemjson: wrapInPage
    });
};

function wrapInPage(bemjson, meta) {
    var basename = path.basename(meta.filename, '.bemjson.js');
    var res = {
        block: 'page',
        title: naming.stringify(meta.notation),
        head: [
            { elem: 'css', url: '_' + basename + '.css' },
            { elem: 'js', url: '_' + basename + '.js' }
        ],
        content: bemjson
    };
    var theme = getThemeFromBemjson(bemjson);

    if (theme) {
        res.mods = { theme: theme };
    }

    return res;
}

function getThemeFromBemjson(bemjson) {
    var theme;

    if (Array.isArray(bemjson)) {
        for (var i = 0; i < bemjson.length; ++i) {
            theme = getThemeFromBemjson(bemjson[i]);

            if (theme) {
                return theme;
            }
        }
    } else {
        for (var key in bemjson) {
            if (bemjson.hasOwnProperty(key)) {
                var value = bemjson[key];

                if (key === 'mods') {
                    var mods = bemjson[key];

                    theme = mods && mods.theme;

                    if (theme) {
                        return theme;
                    }
                }

                if (key === 'content' && Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                    return getThemeFromBemjson(bemjson[key]);
                }
            }
        }
    }
}
