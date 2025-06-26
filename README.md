# Inklumin Monorepository

В репозитории хранится исходный код сервиса **Inklumin**. Это монорепозиторий, включающий следующие независимые проекты:

- **`inklumin-front`** – Фронт-энд сервиса
- **`inklumin-back`** – Spring Boot REST API
- **`inklumin-ml`** – API на Flask 

Front-back интеграция использует openapi.yaml

Каждый из проектов может разрабатываться и разворачиваться отдельно. Ниже краткое описание проектов, их назначения и инструкция запуска.

## inklumin-front 
InkLimin - браузерное приложение, позволяющее работать с книгами, сценами и заметками. Оно также позволяет вести конфигурировать и вести Базу Знаний книги. Ключевые функции описаны в front-end README:

```
* Управление книгами
* Управление сценами/главами
* Управление заметками
* Конфигурирование и наполнение базы знаний ("Blocks" и "Block Instances")
* Расширенное редактирование текста
```
【F:inklumin-front/README.md】

Приложение использует React с Mantine UI, Zustand для стейт менеджмента и Dexie для работы с локальной базой IndexedDB. Роутинг управляется React Router DOM, редактирование текста производится при помощи TipTap. Развертывание и сборка приложения осуществляется Vite с ипользованием TypeScript.

Чтобы запустить клиент локально, укажите адреса сервисов через переменные окружения:

```bash
cd inklumin-front
yarn install
VITE_INKLUMIN_API_URL=http://localhost:8080/api yarn dev
```

Dev server запускается на порту 5173 по-умолчанию.

### Установка Node.js и запуск сборки

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

## inklumin-back
Бэкэнд - Spring Boot приложение, предоставляющее REST эндпоинты для авторизации и работы с пользовательскими данными.
Часть эндпоинтов используется для проксирования запросов из front в ml
Приложение использует PostgreSQL для хранения данных и выпускает JWT токены. 
Ключевые компоненты используют Entity/Controller `User`, `UserBook` и `UserConfigData` для `/api/auth`, `/api/books` и `/api/user`.

Конфигурация приложения храниться в `src/main/resources/application.yml`:

```
server:
  port: 8080
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/inklumin
```
【F:inklumin-back/src/main/resources/application.yml】

Запуск приложения при помощи Maven:

```bash
cd inklumin-back
./mvnw spring-boot:run
```

## inklumin-ml
Проект - небольшое Flask приложение, предоставляющее утилитарные функции для анализа текста, такие как морфологический разбор, склонение фраз и определение повторов и штампов в тексте.
Приложение запускается на порту 5123.

В `app.py` определены эндпоинты `/get_cases`, `/find_repeats` and `/analyze_cliches`:

```
@app.route('/get_cases', methods=['POST'])
@cross_origin()
@token_required
```
【F:inklumin-ml/app.py】

Запуск приложения:

```bash
cd inklumin-ml
python app.py
```

## Структура репозитория
```
inklumin-front/   # React client application
inklumin-back/    # Spring Boot REST API
inklumin-ml/      # Flask based text analysis helpers
repo.monorepo.code-workspace  # VS Code workspace file
```

Каждый проект имеет свои зависимости и рабочий процесс. Подробные инструкции см. в каталогах.



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

## Контракт между фронтэнд и бэкэнд - openapi.yaml
- `openapi.yaml` расположен в корне репозитория. После изменения спецификации запустите в inklumin-front
  ```bash
  npx openapi-typescript-codegen --input openapi.yaml \
    --output inklumin-front/src/api/inkLuminApi --name inkLuminApi.ts
  ```
  Результаты генерации (`inkLuminApi.ts` и `generatedTypes.ts`) появятся в каталоге
  `inklumin-front/src/api/inkLuminApi`.

## Недостающая документация

- Требуется описание настройки базы данных и схемы миграций для `inklumin-back`.
- Нет раздела о запуске `inklumin-back` и `inklumin-ml` в продакшене.

- Не описан процесс тестирования и линтинга фронтенда.
