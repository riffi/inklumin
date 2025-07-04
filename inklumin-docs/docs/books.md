---
sidebar_position: 2
---

# Работа с произведениями

Раздел **Books** (`/books`) содержит список ваших произведений и материалов. Здесь можно создавать новые записи и открывать существующие. 

Для каждого произведения доступна **панель управления** (`/book/dashboard`), где отображаются связанные сцены, заметки и другие элементы. Чтение текста выполняется во встроенной **читалке** (`/book/reader`).

## Сцены и главы

Страница **Scenes** (`/scenes?bookId=<id>`) предназначена для создания и сортировки сцен по главам. Каждая сцена открывается в отдельном редакторе (`/scene/card?id=<sceneId>`), поддерживающем форматирование текста и привязку экземпляров блоков.

Локальная база данных хранит главы, сцены и текст сцен, что позволяет работать с проектом офлайн.
