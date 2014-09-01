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
    var basename = '_' + path.basename(meta.filename, '.bemjson.js');
    return {
        block : 'page',
        title : naming.stringify(meta.notation),
        head : [{ elem : 'css', url : basename + '.css' }],
        scripts : [{ elem : 'js', url : basename + '.js' }],
        mods : { theme : getThemeFromBemjson(bemjson) },
        content : bemjson
    };
}

function getThemeFromBemjson(bemjson) {
    if(typeof bemjson !== 'object') return;

    var theme, key;

    for(key in bemjson) {
        if(theme = key === 'mods' ? bemjson.mods.theme :
            getThemeFromBemjson(bemjson[key])) return theme;
    }
}
