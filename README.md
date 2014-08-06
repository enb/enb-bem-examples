enb-bem-examples
================

[![NPM version](https://badge.fury.io/js/enb-bem-examples.svg)](http://badge.fury.io/js/enb-bem-examples) [![Build Status](https://travis-ci.org/enb-bem/enb-bem-examples.svg?branch=master)](https://travis-ci.org/enb-bem/enb-bem-examples) [![Dependency Status](https://david-dm.org/enb-bem/enb-bem-examples.svg)](https://david-dm.org/enb-bem/enb-bem-examples)

Инструмент для генерации уровней-сетов из примеров БЭМ-блоков с помощью [ENB](http://enb-make.info/).

Установка:
----------

```sh
$ npm install --save-dev enb-bem-examples
```

Для работы модуля требуется зависимость от пакета `enb-bem-sets` версии `0.5.0` или выше.

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

Для сборки всех наборов примеров, запускаем сборку `desktop.examples` сета:

```sh
$ ./node_modules/.bin/sets make desktop.examples
```

Для сборки примеров, относящихся к конкретной БЭМ-сущности, запускаем:

```sh
$ ./node_modules/.bin/sets make desktop.examples/block__elem
```

Для сборки конкретного примера, запускаем:

```sh
$ ./node_modules/.bin/sets make desktop.examples/block__elem/10-simple
```

Пример использования можно посмотреть в директории `examples/silly`.
