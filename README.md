enb-bem-examples
================

[![NPM version](http://img.shields.io/npm/v/enb-bem-examples.svg?style=flat)](http://www.npmjs.org/package/enb-bem-examples) [![Build Status](http://img.shields.io/travis/enb-bem/enb-bem-examples/master.svg?style=flat)](https://travis-ci.org/enb-bem/enb-bem-examples) [![Dependency Status](http://img.shields.io/david/enb-bem/enb-bem-examples.svg?style=flat)](https://david-dm.org/enb-bem/enb-bem-examples)

Инструмент для генерации уровней-сетов из примеров БЭМ-блоков с помощью [ENB](http://enb-make.info/).

Установка:
----------

```sh
$ npm install --save-dev enb-bem-examples
```

Для работы модуля требуется зависимость от пакета `enb-magic-factory` версии `0.2.x`.

Технология examples
-------------------

Примеры — это обычные бандлы, которые располагаются в папке-технологии `examples` той БЭМ-сущности, которой они принадлежат.
На файловой системе они складываются плоским списком (`simple`-уровень):

```sh
$ tree -a <level>.blocks/<block-name>/<block-name>.examples

<block-name>.examples/
 ├── 10-simple.bemjson.js
 ├── 10-simple.title.txt
 ├── 20-complex.bemjson.js
 └── 20-complex.title.txt
```

У каждого примера может быть свой уровень блоков:

```sh
$ tree -a <level>.blocks/<block-name>/<block-name>.examples

<block-name>.examples/
 ├── blocks/                    # уровень для всех примеров блока <block-name>
 ├── 10-simple.blocks/          # уровень для примера 10-simple
 └── 10-simple.bemjson.js
```

В результате будет построен набор из обычных уровней бандлов (`nested`-уровни):

```sh
$ tree -a <sets-name>.examples

<sets-name>.examples
 └── <block-name>/
      ├── 10-simple/
          ├── blocks/
          └── 10-simple.bemjson.js
      └── 20-complex/
          ├── blocks/
          └── 20-complex.bemjson.js
```

Как использовать?
-----------------

```js
module.exports = function (config) {
    config.includeConfig('enb-bem-examples');

    var examples = config.module('enb-bem-examples') // Создаём конфигуратор сетов
        .createConfigurator('examples');             //  в рамках `examples` таска.

    examples.configure({                     // Декларируем сборку и запуск спеков.
        destPath: 'desktop.examples',        // Указываем путь до уровня-сета.
        levels: getLevels(config)            // Указываем уровни для БЭМ-сущностей
                                             //  которых нужно собирать примеры
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
```

Для сборки всех наборов примеров, запускаем таск:

```sh
$ ./node_modules/.bin/enb make examples
```

Для сборки примеров, относящихся к конкретной БЭМ-сущности, запускаем:

```sh
$ ./node_modules/.bin/enb make examples desktop.examples/block__elem
```

Для сборки конкретного примера, запускаем:

```sh
$ ./node_modules/.bin/enb make examples desktop.examples/block__elem/10-simple
```

Пример использования можно посмотреть в директории `examples/silly`.
