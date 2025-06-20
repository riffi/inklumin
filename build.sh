#!/usr/bin/env bash
# Скрипт для сборки проектов inklumin-back и inklumin-front
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Сборка back-end
echo "Собираем inklumin-back"
cd "$REPO_ROOT/inklumin-back"
mvn clean package

# Сборка front-end
echo "Собираем inklumin-front"
cd "$REPO_ROOT/inklumin-front"

# используем локальную версию Yarn
YARN_FILE="$REPO_ROOT/inklumin-front/.yarn/releases/yarn-4.8.1.cjs"
if ! command -v node >/dev/null; then
  echo "Node.js не найден. Установите его перед запуском сборки" >&2
  exit 1
fi

node "$YARN_FILE" install
node "$YARN_FILE" build

cd "$REPO_ROOT"
echo "Сборка завершена"
