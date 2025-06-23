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
VITE_INKLUMIN_API_URL=http://localhost:8080/api \
VITE_INKLUMIN_ML_API_URL=http://localhost:5123 yarn dev
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
VITE_INKLUMIN_ML_API_URL=http://localhost:5123 \
node .yarn/releases/yarn-4.8.1.cjs build
```

Или запустите скрипт `build.sh` в корне репозитория, предварительно задав переменные
`VITE_INKLUMIN_API_URL` и `VITE_INKLUMIN_ML_API_URL`.

## Запуск с помощью Docker

Для запуска всех сервисов потребуется Docker и Docker Compose.

1. Соберите контейнеры и запустите их:
   ```bash
   docker compose up --build -d
   ```
   При необходимости можно изменить адреса сервисов,
   задав переменные `INKLUMIN_API_URL` и `INKLUMIN_ML_API_URL` в `docker-compose.yml`.
2. Фронтенд будет доступен по адресу http://localhost,
   API — на http://localhost:8080,
   сервис ML — на http://localhost:5123.

Остановить сервисы можно командой `docker compose down`.
