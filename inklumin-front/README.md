# InkLumin

InkLumin — это комплексное приложение, предназначенное для помощи писателям в организации их творческих проектов. Оно предоставляет инструменты для управления произведениями, материалами, структурирования сцен, создания заметок и настройки элементов контента с помощью встроенного Configurator.

## Основные возможности

*   **Управление произведениями:** Создавайте и организуйте произведения и материалы
*   **Управление сценами:** Структурируйте свои произведения с помощью глав и сцен.
*   **Создание заметок:** Храните свои идеи, исследования и заметки в приложении.
*   **Настройка контента:** Определяйте пользовательские структуры контента ("Blocks" и "Block Instances") в соответствии с вашими уникальными писательскими потребностями с помощью Configurator.
*   **Расширенное редактирование текста:** Продвинутые возможности редактирования текста для вашего контента.

## Пользовательские функции и возможности

InkLumin предлагает ряд функций для оптимизации вашего писательского процесса:

### Управление произведениями
*   **Создание и список произведений:** Перейдите в раздел "Books" (`/books`), чтобы просмотреть существующие произведения или создать новое.
*   **Панель управления произведением:** Каждое произведение имеет специальную панель управления (`/book/dashboard`), предоставляющую обзор и доступ к его содержимому (сценам, заметкам и т.д.).
*   **Читалка:** Встроенная читалка (`/book/reader`) для комфортного чтения написанного вами произведения.

### Управление сценами и главами
*   **Организация по сценам:** Раздел "Scenes" (`/scenes`) позволяет создавать, редактировать и упорядочивать сцены, обычно в рамках глав, для структурирования вашего повествования.
*   **Редактор сцен:** Специальное представление (`/scene/card`) для написания и детализации отдельных сцен, вероятно, с использованием редактора форматированного текста.

### Создание заметок
*   **Централизованные заметки:** Управляйте всеми своими заметками в разделе "Notes" (`/notes`).
*   **Организация по папкам:** Организуйте заметки по папкам для большей наглядности (`/notes/folder/:folderUuid`).
*   **Редактор заметок:** Полнофункциональный редактор (`/notes/edit/:uuid`) для написания и форматирования ваших заметок.

### Configurator и пользовательский контент
Это расширенная функция, позволяющая определять и управлять многократно используемыми структурами контента.
*   **Главная страница Configurator:** Доступ к Configurator через (`/configurator`).
*   **Определение "Blocks":** Создавайте и определяйте "Blocks" (`/block/edit`). "Block" можно рассматривать как шаблон или тип элемента контента (например, Персонаж, Местоположение, Сюжетная арка).
*   **Управление конфигурациями:** Управляйте общими конфигурациями для ваших "Blocks" (`/configuration/edit`).
*   **Управление экземплярами "Block Instances":** Создавайте экземпляры определенных вами "Blocks" (`/block-instance/manager` и `/block-instance/card`). Например, если у вас есть "Block" под названием "Персонаж", его экземпляром будет "Иван Иванов". Эти экземпляры затем можно связывать или использовать в ваших сценах или заметках.

### Общее
*   **Настройки:** Настраивайте параметры приложения в разделе "Settings" (`/settings`).
*   **Расширенное редактирование текста:** Большинство областей создания контента (сцены, заметки, экземпляры "Block Instances") используют мощный редактор форматированного текста (на базе TipTap), поддерживающий различные параметры форматирования.
*   **AI помощник:** На странице `/book/agent` можно задать вопрос боту. Агент имеет доступ к локальной базе данных выбранного произведения и использует функции `findBook`, `getScene`, `searchInstances` для формирования ответа.

### Структура bookDB
Локальная база данных произведения хранит таблицы:
- `books` — метаданные произведения (uuid, title, author, configurationUuid и др.)
- `chapters` — главы (id, title, order, contentSceneId)
- `scenes` — сцены (id, title, order, chapterId)
- `sceneBodies` — текст сцен (sceneId, body)
- `blockInstances` — экземпляры блоков (uuid, blockUuid, title, hostInstanceUuid, blockInstanceGroupUuid)
- `blockInstanceGroups` — группы экземпляров блоков (uuid, blockUuid, title, order)
- `blockParameterInstances` — значения параметров экземпляров (uuid, blockInstanceUuid, blockParameterUuid, blockParameterGroupUuid, value)
- `blockInstanceRelations` — связи между экземплярами (uuid, blockRelationUuid, sourceInstanceUuid, targetInstanceUuid, sourceBlockUuid, targetBlockUuid)
- `blockInstanceSceneLinks` — привязки экземпляров к сценам (uuid, blockInstanceUuid, sceneId, blockUuid, title)
- `userDocPages` — страницы базы знаний.

## Страницы и навигация

Приложение структурировано на несколько ключевых страниц, доступных в основном через главное навигационное меню (конкретный макет которого, например, боковая панель или верхняя панель, управляется `BaseLayout`).

*   **`/` (Корневой путь):** Обычно перенаправляет или загружает представление по умолчанию, часто это страница "Books" или общая панель управления.
*   **`/books` (Страница произведений и материалов):** Отображает список всех ваших произведений и материалов. Часто это главная целевая страница после входа в систему или при первоначальной загрузке. Отсюда вы можете создавать новые произведения или открывать существующие.
*   **`/book/dashboard?id=<bookId>` (Панель управления произведением/материалом):** Предоставляет центральный узел для выбранного произведения/материала. Предлагает быстрый доступ к сценам, заметкам, персонажам и другим элементам, связанным с этим конкретным произведением/материалом
*   **`/book/reader?id=<bookId>` (Читалка):** Специальный интерфейс для чтения содержимого произведения.
*   **`/scenes?bookId=<bookId>` (Страница сцен):** Список всех сцен, обычно организованных по главам, для конкретного произведения. Здесь вы можете добавлять, редактировать или изменять порядок сцен.
*   **`/scene/card?id=<sceneId>` (Карточка/редактор сцены):** Страница, где вы пишете и редактируете содержимое отдельной сцены.
*   **`/notes` (Менеджер заметок):** Ваша личная записная книжка. Список всех ваших заметок, возможно, с опциями фильтрации и сортировки.
*   **`/notes/folder/:folderUuid` (Папка с заметками):** Отображает заметки в определенной папке.
*   **`/notes/edit/:uuid` (Редактор заметок):** Страница для создания или редактирования отдельной заметки.
*   **`/configurator` (Центр Configurator):** Главная точка входа для функций настройки контента. Отсюда вы можете управлять "Blocks" и "Configurations".
*   **`/block/edit?id=<blockId>` (Редактор "Block"):** Определите или измените тип "Block" (например, его поля и свойства).
*   **`/configuration/edit?id=<configId>` (Редактор конфигурации):** Управляйте настройками, связанными с тем, как группируются или ведут себя "Blocks".
*   **`/block-instance/manager?blockId=<blockId>` (Менеджер экземпляров "Block Instance"):** Просмотр и управление всеми созданными экземплярами определенного типа "Block".
*   **`/block-instance/card?id=<instanceId>` (Редактор экземпляра "Block Instance"):** Создание или редактирование определенного экземпляра "Block".
*   **`/settings` (Страница настроек):** Содержит общесистемные настройки и предпочтения.
*   **`/db-viewer` (Просмотрщик базы данных):** Техническая страница для разработчиков для проверки локальной базы данных приложения. Обычно не используется обычными пользователями.

Навигация между этими страницами обычно осуществляется с помощью ссылок в пользовательском интерфейсе, таких как кнопки, пункты меню или путем нажатия на элементы в списке (например, нажатие на название произведения для перехода на его панель управления).

## Обзор архитектуры

InkLumin — это современное веб-приложение, созданное с упором на реактивный пользовательский интерфейс и локальное сохранение данных.

### Ключевые технологии
*   **Фреймворк для фронтенда:** [React](https://react.dev/) для создания пользовательского интерфейса.
*   **UI Компоненты:** [Mantine UI](https://mantine.dev/) предоставляет обширную библиотеку готовых и настраиваемых React компонентов.
*   **Управление состоянием:** [Zustand](https://github.com/pmndrs/zustand) используется для глобального управления состоянием на стороне клиента, предлагая простое и масштабируемое решение.
*   **Клиентская база данных:** [Dexie.js](https://dexie.org/) используется для управления локальной базой данных IndexedDB в браузере. Это обеспечивает надежное офлайн-хранение данных и быстрые запросы.
*   **Маршрутизация:** [React Router DOM](https://reactrouter.com/) обрабатывает маршрутизацию и навигацию на стороне клиента.
*   **Расширенное редактирование текста:** [TipTap](https://tiptap.dev/) (на основе ProseMirror) предоставляет мощные возможности для редактирования форматированного текста.
*   **Инструмент сборки:** [Vite](https://vitejs.dev/) используется для быстрой разработки сборок и оптимизированной сборки для продакшена.
*   **Язык:** [TypeScript](https://www.typescriptlang.org/) для статической типизации и улучшения качества кода.

### Структура каталогов (`src/`)
Каталог `src/` содержит основной код приложения:
*   **`api/`**: Содержит модули для взаимодействия с внешними API (например, YandexSpeller для проверки орфографии, OpenRouter для интеграции с ИИ, inkLumin).
*   **`components/`**: Многократно используемые UI компоненты. Этот раздел далее подразделяется по функциям (например, `components/books`, `components/scenes`, `components/notes`) или общим элементам (`components/shared`, `components/layout`).
*   **`entities/`**: Определяет структуры данных (интерфейсы/типы) и схему базы данных (определения таблиц Dexie, такие как `bookDb.ts`, `configuratorDb.ts`). Это центральный элемент организации данных.
*   **`pages/`**: React компоненты верхнего уровня, которые соответствуют различным представлениям или страницам приложения, как определено в `Router.tsx`.
*   **`providers/`**: React Context провайдеры для сквозных задач, таких как управление диалогами (`DialogProvider`), адаптивность к медиа-запросам (`MediaQueryProvider`) и динамические заголовки страниц (`PageTitleProvider`).
*   **`repository/`**: Реализует паттерн Repository. Эти модули (например, `BookRepository`, `SceneRepository`) абстрагируют логику доступа к данным, предоставляя чистый API для взаимодействия с базой данных Dexie (например, операции CRUD).
*   **`stores/`**: Глобальные хранилища состояний, управляемые Zustand (например, `bookStore.ts` для состояния, связанного с произведениями, `uiSettingsStore.ts` для предпочтений пользовательского интерфейса).
*   **`Router.tsx`**: Определяет все маршруты приложения на стороне клиента.
*   **`main.tsx`**: Главная точка входа для React приложения.
*   **`theme.ts`**: Конфигурация темы Mantine (цвета, типографика и т.д.).
*   **`utils/`**: Вспомогательные функции, используемые во всем приложении.

### Поток данных
1.  **Взаимодействие с пользователем:** Пользователь взаимодействует с UI компонентами (из `components/` или `pages/`).
2.  **Обновление состояния/Действие:** Действия могут вызывать обновления состояния в хранилищах Zustand (`stores/`) или вызывать функции в модулях repository (`repository/`).
3.  **Repository:** Репозитории взаимодействуют с Dexie.js (`entities/bookDb.ts`) для выполнения операций с базой данных (чтение, запись, обновление, удаление).
4.  **Отображение данных:** Компоненты подписываются на хранилища Zustand или получают данные через props (часто получаемые через репозитории) и повторно отображаются для вывода обновленной информации.

## Getting Started / Setup

To run InkLumin-front locally for development or contributions:

1.  **Clone the Repository:**
    ```bash
    git clone git@github.com:riffi/inklumin.git
    cd inklumin/inklumin-front
    ```
    (Replace `<repository-url>` with the actual URL of the repository)

2.  **Install Dependencies:**
    The project uses Yarn as its package manager (specified by `packageManager": "yarn@4.8.1"` in `package.json`).
    ```bash
    yarn install
    ```

3.  **Run the Development Server:**
    This command starts Vite's development server. Укажите адреса сервисов с помощью переменных окружения:
    ```bash
    VITE_INKLUMIN_API_URL=http://localhost:8080/api yarn dev
    ```
    The application should typically be accessible at `http://localhost:5173` (Vite's default) or a similar address indicated in the terminal output.

4.  **Build for Production:**
    To create an optimized production build. Адреса сервисов задаются аналогично:
    ```bash
    VITE_INKLUMIN_API_URL=http://localhost:8080/api yarn build
    ```
    The output will be in the `dist` folder. You can preview this build locally using `yarn preview`.

### Available Scripts

The `package.json` file defines several scripts for development and maintenance:

*   `yarn dev`: Starts the development server with Vite.
*   `yarn build`: Builds the application for production.
*   `yarn preview`: Previews the production build locally.
*   `yarn typecheck`: Checks TypeScript types for errors.
*   `yarn lint`: Runs ESLint and Stylelint to check for code style and potential errors.
*   `yarn prettier`: Checks code formatting with Prettier.
*   `yarn prettier:write`: Formats code with Prettier.
*   `yarn vitest`: Runs unit and integration tests using Vitest.
*   `yarn vitest:watch`: Runs tests in watch mode.
*   `yarn test`: A comprehensive script that runs `typecheck`, `prettier`, `lint`, `vitest`, and `build`.
*   `yarn storybook`: Starts the Storybook development server for viewing and testing UI components in isolation.
*   `yarn storybook:build`: Builds Storybook as a static app.

**Note:** Since the application uses Dexie.js for client-side storage, all your data (books, scenes, notes, etc.) will be stored in your browser's IndexedDB. Clearing your browser's site data for this application will erase your local SoulWriter data.

## Структура bookDb

bookDb — локальная база данных Dexie.js, создаваемая для каждого произведения. Она наследует таблицы из `BlockAbstractDb`, отвечающие за конфигурацию блоков, и дополняет их собственными таблицами произведения.

### Таблицы из BlockAbstractDb
Таблицы описывают структуру элементов произведения
Все boolean атрибуты хранятся в виде 1 или 9

- **bookConfigurations** — в таблице только одна запись конфигурация текущего произведения.
    - `id` — автоинкрементный ключ.
    - `uuid` — уникальный идентификатор конфигурации.
    - `title` — название конфигурации.
    - `description` — описание.
- **blocks** — описания строительных блоков произведения(примеры: Персонажи, Города, Сюжетные линии, Места действия)
    - `id` — ключ.
    - `uuid` — идентификатор блока.
    - `title` — название блока. хранится в единственном числе
    - `configurationUuid` — ссылка на конфигурацию.
    - `description` — текстовое описание.
    - `useTabs` — использовать ли вкладки.(1 - в редакторе экземпляра блока, показываются вкладки для каждой из blockParameterGroups, 0 - вкладки скрываются и отображаются только экземпляры первой вкладки)
    - `useGroups` — группировать ли экземпляры.(1 - в менеджере экземпляров блока можно создавать группы экземпляров(blockInstanceGroups) в виде вкладок, 0 - вкладки не отображаются)
    - `structureKind` — вид структуры. ('single' - может быть создан только один экземпляр блока, при создании блока такой единичный экземпляр создается по-умолчанию)
    - `displayKind` — вид отображения.(используется только для вложенных блоков, влияет на то как вложенные экземпляры будут отображается на странице редактирования хост экземпляра "list", "timeLine")
    - `hostBlockUuid` — идентификатор хост блока, если присутствует, текущий блок считается вложенным
    - `titleForms` — формы названия. Склонения и множественное число названия, используется для отображения в интерфейсе({nominative, genitive, dative, accusative, instrumental,  prepositional,  plural})
    - `sceneLinkAllowed` — можно ли связывать со сценами.
    - `icon` — иконка блока.
    - `showInSceneList` — отображать в списке сцен.
    - `showInMainMenu` — отображать в меню.
    - `showBigHeader` — крупный заголовок в редакторе на мобильных.
    - `userDocPageUuid` — связанная страница базы знаний.
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
    - `userDocPageUuid` — страница базы знаний.
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
      nestedBlock - на вкладке отображаются вложенные экземпляры блоков текущего экземпляра блока,
      referencingParam - на вкладке отображаются все экземпляры блоков, у которых есть blockParameterInstance, ссылающиеся на текущий экземпляр блока,
      scenes - на вкладке отображаются сцены, к которым привязан текущий экземпляр блока через blockInstanceSceneLinks})
    - `relationUuid` — связь для вкладки "relation".
    - `nestedlockUuid` — вложенный блок.
    - `referencingParamUuid` — параметр обратной ссылки.
    - `isDefault` — вкладка по умолчанию.
- **userDocPages** — страницы базы знаний.
    - `id` — ключ.
    - `uuid` — идентификатор страницы.
    - `title` — заголовок.
    - `markdown` — содержимое страницы.
    - `configurationUuid`/`bookUuid` — привязка к конфигурации или произведению.

### Дополнительные таблицы bookDb

- **books** — произведения и материалы.
    - `id` — ключ.
    - `uuid` — уникальный идентификатор.
    - `title` — название.
    - `author` — автор.
    - `form` — форма произведения.
    - `genre` — жанр.
    - `configurationUuid` — используемая конфигурация.
    - `configurationTitle` — имя конфигурации.
    - `cover` — обложка.
    - `kind` — тип (material - материал или book - произведение)
    - `chapterOnlyMode` — режим глав.(сцены скрываются в интерфейсе)
    - `description` — аннотация.
    - `localUpdatedAt`/`serverUpdatedAt` — даты обновления.
    - `syncState` — состояние синхронизации.
- **scenes** — сцены произведения.
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
- **chapters** — главы произведения.
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
    - `hostInstanceUuid` — хост экземпляр для случая если блок вложенный.
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

### Запуск тестов и линтеров

Перед коммитом рекомендуется проверять форматирование проекта:

```bash
yarn prettier
```

Для полного цикла проверки, включающего типизацию, линт и тесты,
используйте команду:

```bash
yarn test
```

## Недостающая документация

- Требуется более подробное описание работы Zustand и Dexie.
- Нет инструкции по подключению к внешним сервисам.
- Отсутствует руководство по структуре локальной базы данных.
