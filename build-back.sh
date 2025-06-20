#!/usr/bin/env bash
# Скрипт для сборки и перезапуска inklumin-back
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Сборка back-end
echo "Собираем inklumin-back"
cd "$REPO_ROOT/inklumin-back"
mvn clean package

cd "$REPO_ROOT"
echo "Сборка завершена"

echo "Перезапускаем inklumin-back"
sudo service soulwriter restart
echo "Back перезапущен"

