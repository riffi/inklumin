# Guidelines for AI Agents

This repository is a monorepo with several independent projects.

## Testing and Linting

- When modifying any files under `inklumin-front/`, run the following commands before committing:
  ```bash
  cd inklumin-front
  yarn prettier
  yarn lint
  yarn vitest
  ```
  `yarn test` can be used instead if a full build is required.
- There are currently no automated tests for `inklumin-back` or `inklumin-ml`.

## Commit Messages

Use concise commit messages and describe your changes clearly.
Commit message must be in russian language

## Pull Requests
Summaries should mention any manual steps or special considerations.
Summary must be in russian language

## Endpoint changing in inklumin-back

when adding, changing, deleting endpoints contract in inklumin-back update [openapi.yaml](openapi.yaml)

## Comments
code comments be in russian language
