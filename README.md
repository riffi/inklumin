# 🌟 Inklumin Monorepository

В репозитории хранится исходный код сервиса **Inklumin**. Это монорепозиторий, включающий следующие независимые проекты:


| Directory | Service | Stack |
|-----------|---------|-------|
| **`inklumin-front`** | Фронт-энд сервиса | React + Vite + Dexie + PWA |
| **`inklumin-back`** | Основной бэк-энд сервиса | Java / Spring Boot |
| **`inklumin-ml`** | ML сервис | Python / Flask |
| **`inklumin-landing`** | Лендинг страница сервиса | HTML |
---

## 🚀 Быстрый старт

### 1. Docker Compose (рекомендованный вариант)

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

### 2. Документация

Описание каждого из приложений хранится в README соответствующих каталогов.

Front-back интеграция использует openapi.yaml

Каждый из проектов может разрабатываться и разворачиваться отдельно.

Ниже краткое описание проектов, их назначения и инструкция запуска.

## Приложения
### inklumin-front 
InkLumin - браузерное приложение, позволяющее работать с произведениями, сценами и заметками. Оно также позволяет конфигурировать и вести Базу Знаний. Ключевые функции описаны в front-end README:

```
* Управление произведениями и материалами
* Управление сценами/главами
* Управление заметками
* Конфигурирование и наполнение базы знаний ("Blocks" и "Block Instances")
* Расширенное редактирование текста
```

Приложение использует React с Mantine UI, Zustand для стейт менеджмента и Dexie для работы с локальной базой IndexedDB. Роутинг управляется React Router DOM, редактирование текста производится при помощи TipTap. Развертывание и сборка приложения осуществляется Vite с использованием TypeScript.

Чтобы запустить клиент локально, укажите адреса сервисов через переменные окружения:

```bash
cd inklumin-front
yarn install
VITE_INKLUMIN_API_URL=http://localhost:8080/api yarn dev
```

Dev server запускается на порту 5173 по-умолчанию.

#### Установка Node.js и запуск сборки

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


#### Сборка приложения через Tauri

##### dev
```bash
npm run dev
npx tauri dev
```

##### production
```bash
npm run build
npx tauri build
```

### inklumin-back
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

Запуск приложения при помощи Maven:

```bash
cd inklumin-back
./mvnw spring-boot:run
```

### inklumin-ml
Проект - небольшое Flask приложение, предоставляющее утилитарные функции для анализа текста, такие как морфологический разбор, склонение фраз и определение повторов и штампов в тексте.
Приложение запускается на порту 5123.

В `app.py` определены эндпоинты `/get_cases`, `/find_repeats` and `/analyze_cliches`:

```
@app.route('/get_cases', methods=['POST'])
@cross_origin()
@token_required
```

Запуск приложения:

```bash
cd inklumin-ml
python app.py
```
### inklumin-landing
Простая html лендинг страница, статика на nginx

## Контракт между фронтэнд и бэкэнд - openapi.yaml
- `openapi.yaml` расположен в корне репозитория. После изменения спецификации запустите в inklumin-front
  ```bash
  npx openapi-typescript-codegen --input openapi.yaml \
    --output inklumin-front/src/api/inkLuminApi --name inkLuminApi.ts
  ```
  Результаты генерации (`inkLuminApi.ts` и `generatedTypes.ts`) появятся в каталоге
  `inklumin-front/src/api/inkLuminApi`.

## Функции приложения
Описаны в `/docs/features.md`

## Недостающая документация

- Требуется описание настройки базы данных и схемы миграций для `inklumin-back`.
- Нет раздела о запуске `inklumin-back` и `inklumin-ml` в продакшене.

- Не описан процесс тестирования и линтинга фронтенда.
