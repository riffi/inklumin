# Inklumin Monorepository

This repository contains the source code for the **Inklumin** platform. It is a monorepo that includes three independent projects:

- **`inklumin-front`** – the SoulWriter web client
- **`inklumin-back`** – Spring Boot REST API
- **`inklumin-ml`** – Flask based helper service

Front-back interaction uses openapi.yaml

Each project can be developed and deployed separately. Below is a short overview of their purpose and how to run them.

## inklumin-front (SoulWriter)
SoulWriter is a browser application that helps writers organise books, scenes and notes. It also features a configurable content system called "Blocks". Key features are outlined in the front-end README:

```
* Управление книгами
* Управление сценами
* Создание заметок
* Настройка контента ("Blocks" и "Block Instances")
* Расширенное редактирование текста
```
【F:inklumin-front/README.md†L5-L18】

The application uses React with Mantine UI, Zustand for state management and Dexie for local IndexedDB storage. Routing is handled by React Router DOM and rich text editing is powered by TipTap. Development and build are handled by Vite using TypeScript.

To start the client locally, укажите адреса сервисов через переменные окружения:

```bash
cd inklumin-front
yarn install
VITE_INKLUMIN_API_URL=http://localhost:8080/api yarn dev
```

The dev server runs on port 5173 by default.

## inklumin-back
The back-end project is a Spring Boot application that exposes REST endpoints for authentication and user data. It relies on PostgreSQL and issues JWT tokens. Important components include the `User`, `UserBook` and `UserConfigData` entities and controllers for `/api/auth`, `/api/books` and `/api/user`.

The server configuration resides in `src/main/resources/application.yml`:

```
server:
  port: 8080
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/inklumin
```
【F:inklumin-back/src/main/resources/application.yml†L1-L9】

Run the API with Maven:

```bash
cd inklumin-back
./mvnw spring-boot:run
```

## inklumin-ml
This directory contains a small Flask service providing text utilities such as morphological case generation and detection of word repeats or clichés. Endpoints require an API token and run on port 5123.

The entry point `app.py` defines routes like `/get_cases`, `/find_repeats` and `/analyze_cliches`:

```
@app.route('/get_cases', methods=['POST'])
@cross_origin()
@token_required
```
【F:inklumin-ml/app.py†L34-L38】

Start the service with:

```bash
cd inklumin-ml
python app.py
```

## Repository structure
```
inklumin-front/   # React client application
inklumin-back/    # Spring Boot REST API
inklumin-ml/      # Flask based text analysis helpers
repo.monorepo.code-workspace  # VS Code workspace file
```

Each project has its own dependencies and workflow. Refer to the directories for detailed instructions.

## Установка Node.js и запуск сборки

На сервере Ubuntu требуется предварительная установка Node.js. Пример для версии 22.x:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

После установки включите поддержку `corepack`, чтобы использовать локальную копию Yarn:

```bash
corepack enable
```

Сборка фронтенда выполняется с помощью файла `.yarn/releases/yarn-4.8.1.cjs`:

```bash
cd inklumin-front
node .yarn/releases/yarn-4.8.1.cjs install
VITE_INKLUMIN_API_URL=http://localhost:8080/api \
node .yarn/releases/yarn-4.8.1.cjs build
```

Или запустите скрипт `build.sh` в корне репозитория, предварительно задав переменную
`VITE_INKLUMIN_API_URL`.

## Запуск с помощью Docker

Для запуска всех сервисов потребуется Docker и Docker Compose.

1. Соберите контейнеры и запустите их:
   ```bash
   docker compose up --build -d
   ```
   При необходимости можно изменить адреса сервисов,
  задав переменную `INKLUMIN_API_URL` в `docker-compose.yml`.
2. Фронтенд будет доступен по адресу http://localhost,
   API — на http://localhost:8080,
   сервис ML — на http://localhost:5123.

Остановить сервисы можно командой `docker compose down`.

## Структура bookDb

bookDb — локальная база данных Dexie.js, создаваемая для каждой книги. Она наследует таблицы из `BlockAbstractDb`, отвечающие за конфигурацию блоков, и дополняет их собственными таблицами книги.

### Таблицы из BlockAbstractDb
Таблицы описывают структуру элементов книги
Все boolean атрибуты хранятся в виде 1 или 9

- **bookConfigurations** — в таблице только одна запись конфигурация текущей книги.
  - `id` — автоинкрементный ключ.
  - `uuid` — уникальный идентификатор конфигурации.
  - `title` — название конфигурации.
  - `description` — описание.
- **blocks** — описания строительных блоков книги(примеры: Персонажи, Города, Сюжетные линии, Места действия)
  - `id` — ключ.
  - `uuid` — идентификатор блока.
  - `title` — название блока. хранится в единственном числе
  - `configurationUuid` — ссылка на конфигурацию.
  - `description` — текстовое описание.
  - `useTabs` — использовать ли вкладки.(1 - в редакторе экземпляра блока, показываются вкладки для каждой из blockParameterGroups, 0 - вкладки скрываются и отображаются только экземпляры первой вкладки)
  - `useGroups` — группировать ли экземпляры.(1 - в менеджере экземпляров блока можно создавать группы экземпляров(blockInstanceGroups) в виде вкладок, 0 - вкладки не отображаются)
  - `structureKind` — вид структуры. ('single' - может быть создан только один экземпляр блока, при создании блока такой единичный экземпляр создается по-умолчанию)
  - `displayKind` — вид отображения.(используется только для дочерних блоков, влияет на то как дочерние экземпляры будут отображается на странице редактирования родительского экземпляра "list", "timeLine")
  - `parentBlockUuid` — идентификатор родительского блока, если присутствует, блок считается дочерним
  - `titleForms` — формы названия. Склонения и множественное число названия, используется для отображения в интерфейсе({nominative, genitive, dative, accusative, instrumental,  prepositional,  plural})
  - `sceneLinkAllowed` — можно ли связывать со сценами.
  - `icon` — иконка блока.
  - `showInSceneList` — отображать в списке сцен.
  - `showInMainMenu` — отображать в меню.
  - `knowledgeBasePageUuid` — связанная страница базы знаний.
- **blockParameterGroups** — группы параметров блоков
  - `id` — ключ.
  - `uuid` — идентификатор группы.
  - `title` — название группы.
  - `blockUuid` — идентификатор блока.
  - `description` — описание.
  - `orderNumber` — порядок отображения.
- **blockParameters** — параметры блоков.
  - `id` — ключ.
  - `uuid` — идентификатор параметра.
  - `title` — название.
  - `groupUuid` — группа параметров.
  - `blockUuid` — идентификатор блока.
  - `description` — описание параметра.
  - `dataType` — тип значения.({string,text, checkbox,datePicker,colorPicker, dropdown,  blockLink})
  - `isDefault` — добавлять по умолчанию blockParameterInstance при создании экземпляра блока
  - `displayInCard` — выводить в карточке экземпляра блока в менеджере экземпляров
  - `orderNumber` — порядок отображения.
  - `linkedBlockUuid` — ссылка на другой блок.
  - `allowMultiple` — можно создавать несколько blockParameterInstance.
  - `useForInstanceGrouping` — использовать для группировки экземпляров в менеджере экземпляров.
  - `knowledgeBasePageUuid` — страница базы знаний.
- **blockParameterPossibleValues** — значения для выпадающих списков, используется для blockParameters.dataType === dropdown
  - `id` — ключ.
  - `uuid` — идентификатор значения.
  - `parameterUuid` — ссылка на параметр.
  - `value` — текст значения.
  - `orderNumber` — порядок.
- **blocksRelations** — связи между блоками.
  - `id` — ключ.
  - `uuid` — идентификатор связи.
  - `sourceBlockUuid` — исходный блок.
  - `targetBlockUuid` — целевой блок.
  - `relationType` — тип связи.
  - `configurationUuid` — идентификатор конфигурации.
- **blockTabs** — вкладки для редактора блоков.
  - `id` — ключ.
  - `uuid` — идентификатор вкладки.
  - `title` — название вкладки.
  - `orderNumber` — порядок.
  - `blockUuid` — связанный блок.
  - `tabKind` — тип вкладки (
    parameters - на вкладке отображаются blockParameterInstance экземпляра блока, 
    relation - на вкладке отображаются связи blocksRelations, 
    childBlock - на вкладке отображаются дочерние экземпляры блоков текущего экземпляра блока, 
    referencingParam - на вкладке отображаются все экземпляры блоков, у которых есть blockParameterInstance, ссылающиеся на текущий экземпляр блока,
    scenes - на вкладке отображаются сцены, к которым привязан текущий экземпляр блока через blockInstanceSceneLinks})
  - `relationUuid` — связь для вкладки "relation".
  - `childBlockUuid` — дочерний блок.
  - `referencingParamUuid` — параметр обратной ссылки.
  - `isDefault` — вкладка по умолчанию.
- **knowledgeBasePages** — страницы базы знаний.
  - `id` — ключ.
  - `uuid` — идентификатор страницы.
  - `title` — заголовок.
  - `markdown` — содержимое страницы.
  - `configurationUuid`/`bookUuid` — привязка к конфигурации или книге.

### Дополнительные таблицы bookDb

- **books** — информация о книге.
  - `id` — ключ.
  - `uuid` — уникальный идентификатор книги.
  - `title` — название.
  - `author` — автор.
  - `form` — форма произведения.
  - `genre` — жанр.
  - `configurationUuid` — используемая конфигурация.
  - `configurationTitle` — имя конфигурации.
  - `cover` — обложка.
  - `kind` — тип книги.(material или book)
  - `chapterOnlyMode` — режим глав.(сцены скрываются в интерфейсе)
  - `description` — аннотация.
  - `localUpdatedAt`/`serverUpdatedAt` — даты обновления.
  - `syncState` — состояние синхронизации.
- **scenes** — сцены книги.
  - `id` — ключ.
  - `title` — название.
  - `body` — текст сцены.
  - `order` — порядок.
  - `chapterId` — ссылка на главу.
  - `totalSymbolCountWithSpaces`/`totalSymbolCountWoSpaces` — статистика.
- **sceneBodies** — текст сцен.
  - `id` — ключ.
  - `sceneId` — ссылка на сцену.
  - `body` — текст.
- **chapters** — главы книги.
  - `id` — ключ.
  - `title` — название.
  - `order` — порядок.
  - `contentSceneId` — сцена главы. для режима chapterOnlyMode
- **blockInstanceGroups** — группы экземпляров блоков.
  - `id` — ключ.
  - `uuid` — идентификатор группы.
  - `blockUuid` — владелец.
  - `title` — название группы.
  - `order` — порядок.
- **blockInstances** — экземпляры блоков.
  - `id` — ключ.
  - `uuid` — идентификатор экземпляра.
  - `blockUuid` — исходный блок.
  - `title` — название.
  - `parentInstanceUuid` — родительский экземпляр для случая если блок дочерний.
  - `shortDescription` — краткое описание.
  - `icon` — иконка.
  - `updatedAt` — дата обновления.
  - `blockInstanceGroupUuid` — группа.
- **blockParameterInstances** — значения параметров экземпляров.
  - `id` — ключ.
  - `uuid` — идентификатор.
  - `blockInstanceUuid` — экземпляр блока.
  - `blockParameterUuid` — параметр.
  - `blockParameterGroupUuid` — группа параметров.
  - `value` — значение.
- **blockInstanceRelations** — связи экземпляров.
  - `id` — ключ.
  - `uuid` — идентификатор связи.
  - `sourceInstanceUuid` — исходный экземпляр.
  - `targetInstanceUuid` — целевой экземпляр.
  - `sourceBlockUuid` — исходный блок.
  - `targetBlockUuid` — целевой блок.
  - `blockRelationUuid` — модель связи.
- **blockInstanceSceneLinks** — привязки экземпляров к сценам.
  - `id` — ключ.
  - `uuid` — идентификатор.
  - `blockInstanceUuid` — экземпляр блока.
  - `sceneId` — сцена.
  - `blockUuid` — блок.
  - `title` — заголовок связи.

## Недостающая документация

- Требуется описание настройки базы данных и схемы миграций для `inklumin-back`.
- Нет раздела о запуске `inklumin-back` и `inklumin-ml` в продакшене.
- Отсутствует руководство по обновлению `openapi.yaml` и генерации клиентского кода.
- Не описан процесс тестирования и линтинга фронтенда.
