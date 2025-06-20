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
yarn install
yarn build

cd "$REPO_ROOT"
echo "Сборка завершена"
