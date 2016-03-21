enb-bem-examples
================

[![NPM version](https://img.shields.io/npm/v/enb-bem-examples.svg?style=flat)](http://www.npmjs.org/package/enb-bem-examples) [![Build Status](https://img.shields.io/travis/enb/enb-bem-examples/master.svg?style=flat)](https://travis-ci.org/enb/enb-bem-examples) [![Dependency Status](https://img.shields.io/david/enb/enb-bem-examples.svg?style=flat)](https://david-dm.org/enb/enb-bem-examples)

Инструмент для генерации сетов из примеров БЭМ-блоков с помощью [ENB](http://enb-make.info/).

Установка
----------

```sh
$ npm install --save-dev enb-bem-examples
```

Для работы модуля требуется зависимость от пакетов `enb-magic-factory` версии `0.3.x`  или выше, а так же `enb` версии `0.15.0` или выше.

Технология `examples` в файловой системе
-----------------------------------------

Примеры — это обычные бандлы, которые располагаются в папке технологии `examples` той БЭМ-сущности, которой они принадлежат.
В файловой системе они складываются плоским списком (`simple`-уровень):

```sh
$ tree -a <level>.blocks/<block-name>/<block-name>.examples

<block-name>.examples/
 ├── 10-simple.bemjson.js       # `10-simple` бандл в технологии `bemjson.js`
 ├── 10-simple.title.txt        # `10-simple` бандл в технологии `title.txt`
 ├── 20-complex.bemjson.js      # `20-simple` бандл в технологии `bemjson.js`
 └── 20-complex.title.txt       # `20-simple` бандл в технологии `title.txt`
```

У каждого примера может быть свой уровень блоков:

```sh
$ tree -a <level>.blocks/<block-name>/<block-name>.examples

<block-name>.examples/
 ├── blocks/                    # уровень для всех примеров блока `<block-name>`
 ├── 10-simple.blocks/          # уровень только для примера `10-simple`
 └── 10-simple.bemjson.js
```

В результате будет построен сет из примеров, каждый из которых представляет собой обычный бандл (`nested`-уровень):

```sh
$ tree -a <set-name>.examples

<set-name>.examples
 └── <block-name>/                  # папка группирует примеры для БЭМ-сущности
      ├── 10-simple/                # `10-simple` бандл
          ├── <block-name>.blocks/  # уровень для всех примеров блока `<block-name>`
          ├── 10-simple.blocks/     # уровень блоков только для примера `10-simple`
          └── 10-simple.bemjson.js  # `10-simple` бандл в технологии `bemjson.js`
      └── 20-complex/               # `20-simple` бандл
          ├── <block-name>.blocks/  # уровень для всех примеров блока `<block-name>`
          ├── 20-complex.blocks/    # уровень блоков только для примера `20-simple`
          └── 20-complex.bemjson.js # `20-simple` бандл в технологии `bemjson.js`
```

Примеры из документации (инлайновые примеры)
--------------------------------------------

При написании документации в `md`-файлах используют вставки `bemjson`-кода.

Например, вставка `bemjson`-кода для блока `button`:

```bemjson
{
    block: 'button',
    mods: { theme: 'normal', size: 'm', view: 'action' },
    type: 'submit',
    text: 'Action'
}
```

Такие вставки можно собирать в файловую систему в сеты так же, как и обычные примеры технологии `examples`.

При сборке сета название бандла для инлайнового примера будет уникальным. Оно формируется из хэш-суммы `bemjson`-кода примера.

Например, путь до банда с примерами блока `button`, представленным выше:

```
desktop.examples/button/F_1FoglPvs4YpLRQGeUEiM6w4CY
```

Как использовать?
-----------------

В `make`-файле (`.enb/make.js`) нужно подключить модуль `enb-bem-examples`.
С помощью этого модуля следует создать конфигуратор, указав название таска в рамках которого будет происходить сборка уровней сетов из примеров.

Конфигуратор имеет единственный метод `configure`. Его можно вызывать несколько раз, чтобы задекларировать сборку нескольких сетов.

```js
module.exports = function (config) {
    config.includeConfig('enb-bem-examples'); // Подключаем модуль `enb-bem-examples`.

    var examples = config.module('enb-bem-examples') // Создаём конфигуратор сетов
        .createConfigurator('examples');             //  в рамках `examples`-таска.

    examples.configure({
        destPath: 'desktop.examples',
        levels: ['blocks']
    });
};
```

### Опции

* *String* `destPath` &mdash;&nbsp;путь относительно корня до&nbsp;нового сета с&nbsp;бандлами примеров, которые нужно собрать. Обязательная опция.
* *String[] | Object[]* `levels` &mdash;&nbsp;уровни в&nbsp;которых следует искать примеры. Обязательная опция.
* *String[]* `techSuffixes` &mdash;&nbsp;суффиксы папок технологий с&nbsp;примерами. По&nbsp;умолчанию&nbsp;&mdash;&nbsp;`['examples']`.
* *String[]* `fileSuffixes` &mdash;&nbsp;суффиксы файлов внутри папок технологий с&nbsp;примерами. По&nbsp;умолчанию&nbsp;&mdash;&nbsp;`['bemjson.js']`.
* *Boolean* `inlineBemjson` &mdash;&nbsp;определяет возможность создания инлайновых примеров из &nbsp;md-файлов. По&nbsp;умолчанию&nbsp;&mdash;&nbsp;`false`.
* *Function* `processInlineBemjson` &mdash;&nbsp;функция обработки инлайнового `bemjson`.

Запуск из консоли
-----------------

В `make`-файле декларируется таск, в котором будет выполняться сборка сетов из примеров.

В ENB запуск таска осуществляется с помощью команды `make`, которой передаётся имя таска:

```sh
$ ./node_modules/.bin/enb make <task-name>
```

### Сборка всех примеров

Если сборка сетов из примеров была задекларирована в `examples`-таске:

```sh
$ ./node_modules/.bin/enb make examples
```

### Сборка указанного примера (точечная сборка)

Передаём список путей примеров, по которым должны собраться бандлы внутри сета:

```sh
$ ./node_modules/.bin/enb make <task-name> path/to/example-1 path/to/example-2
```

Чтобы собрать пример `10-simple`, принадлежащий БЭМ-сущности `block__elem`, для сета `desktop.examples`:

```sh
$ ./node_modules/.bin/enb make examples desktop.examples/block__elem/10-simple
```

### Сборка всех примеров указанной БЭМ-сущности

Чтобы собрать все примеры БЭМ-сущности `block__elem` для сета `desktop.examples`:

```sh
$ ./node_modules/.bin/enb make examples desktop.examples/block__elem
```

Лицензия
--------

© 2014 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
