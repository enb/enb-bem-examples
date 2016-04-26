История изменений
=================

1.0.2
-----

### Исправление ошибок

* В сборку inline-примеров не попадали общие уровни для примеров блока ([#39]).

1.0.1
-----

### Исправление ошибок

* В сборку inline-примеров не попадали общие уровни для примеров блока ([#30]).

### Зависимости

* Модуль `bem-naming@0.5.1` обновлён до версии `1.0.1`.

1.0.0
-----

### Сборка уровней для примеров

Изменены пути, по которым создаются директории уровней для примеров ([#27]):
  * Уровни, предназначенные для всех примеров блока, будут записаны в директорию `<block-name>/<example-name>/<block-name>.blocks`, вместо `<block-name>/.blocks`.
  * Уровни, предназначенные для конкретного примера, будут записаны в директорию `<block-name>/<example-name>/<example-name>.blocks`, вместо `<block-name>/<example-name>/blocks`.

**Было:**

```
desktop.examples
└── button/
    ├── .blocks/      # уровень для всех примеров блока <block-name>
    ├── 10-simple/
        ├── blocks/   # уровень для примера 10-simple
        └── 10-simple.bemjson.js.symlink
    └── 20-complex/
        └── 20-comples.bemjson.js.symlink
```

**Стало:**

```
desktop.examples
└── button/
    ├── 10-simple/
        ├── <block-name>.blocks/    # уровень для всех примеров блока <block-name>
        ├── 10-simple.blocks/       # уровень для примера 10-simple
        └── 10-simple.bemjson.js.symlink
    └── 20-complex/
        ├── <block-name>.blocks/    # уровень для всех примеров блока <block-name>
        └── 20-comples.bemjson.js.symlink
```

Это означает, что при сборке примеров необходимо изменить поиск уровней.

**Было:**

```js
var path = require('path'),
    fs = require('fs');

module.exports = function(projectConfig) {
    projectConfig.node('desktop.examples/*/*', function(nodeConfig) {
        var nodeDir = nodeConfig.getNodePath(),
            blockLevel = path.join(nodeDir, '..', '.blocks'),
            exampleLevel = path.join(nodeDir, 'blocks'),
            levels = [];

        fs.existsSync(blockLevel) && levels.push(blockLevel);
        fs.existsSync(exampleLevel) && levels.push(exampleLevel);

        /* ... */
    });
};
```

**Стало:**

```js
var path = require('path'),
    fs = require('fs');

module.exports = function(projectConfig) {
    projectConfig.node('desktop.examples/*/*', function(nodeConfig) {
        var nodeDir = nodeConfig.getNodePath(),

            blockName = path.basename(path.dirname(nodeDir)),
            blockLevel = path.join(nodeDir, blockName + '.blocks'),

            exampleName = path.basename(nodeDir),
            exampleLevel = path.join(nodeDir, exampleName + '.blocks'),

            levels = [];

        fs.existsSync(blockLevel) && levels.push(blockLevel);
        fs.existsSync(exampleLevel) && levels.push(exampleLevel);

        /* ... */
    });
};
```

### Исправления ошибок

* Исправлена сборка уровней блока для дальнейшей обработки с помощью `borschik` ([#15]).
* Исправлена точечная сборка примеров: не собирались уровни блока ([#18]).

### Зависимости

* Модуль `vow@0.4.11` обновлен до версии `0.4.12`.

0.6.0
-----

### Крупные изменения

* Добавлена поддержка `enb` версии `1.x` ([#26]).

### Зависимости

* Модуль `enb-bem-pseudo-levels@0.2.6` обновлен до версии `0.3.0`.
* Модуль `vow@0.4.10` обновлен до версии `0.4.11`.

0.5.10
-----

### Исправления ошибок

* Исправлена ошибка для случаев, когда целевая папка (destPath) находится не на первом уровне относительно корня проекта ([#19]).

### Зависимости

* Модуль `bem-naming@0.5.0` обновлён до версии `0.5.1`.
* Модуль `vow@0.4.7` обновлён до версии `0.4.10`.

0.5.9
-----

* Исправлены ошибки при использовании в Windows.
* Модуль `enb-bem-pseudo-levels` обновлён до версии `0.2.6`.
* Модуль `bem-naming` обновлён до версии `0.5.0`.

0.5.8
-----

* Исправлены ошибки при использовании в Windows.
* Модуль `enb-bem-pseudo-levels` обновлён до версии `0.2.5`.

0.5.7
-----

* Модуль `enb-bem-pseudo-levels` обновлён до версии `0.2.4`.

0.5.6
-----

* Для инлайновых примеров теперь можно указывать не только язык `bemjson`, но и `js` (#10).

0.5.5
-----

* Исправлена обработка ошибок при сборке псевдоуровней для множественных запросов на сборку.

0.5.4
-----

* Исправлена сборка закэшированных инлайновых примеров.

0.5.3
-----

* При построении инлайновых примеров теперь используется кэш.
* Модуль `bem-naming` обновлён до версии `0.4.0`.
* Модуль `vow` обновлён до версии `0.4.7`.

0.5.2
-----

* Исправлена сборка нод с инлайновыми примерами.

0.5.1
-----

* Исправлена сборка нод в псевдоуровнях.

0.5.0
-----

* Переход на `enb-magic-factory@0.3.x`.
* Модуль `vow` обновлён до версии `0.4.6`.

[#39]: https://github.com/enb/enb-bem-examples/issues/39
[#30]: https://github.com/enb/enb-bem-examples/issues/30
[#27]: https://github.com/enb/enb-bem-examples/pull/27
[#26]: https://github.com/enb/enb-bem-examples/pull/26
[#19]: https://github.com/enb/enb-bem-examples/issues/19
[#18]: https://github.com/enb/enb-bem-examples/issues/18
[#15]: https://github.com/enb/enb-bem-examples/issues/15
