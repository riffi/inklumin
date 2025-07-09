export enum BlockEditTab {
  main = "main",
  parameters = "parameters",
  relations = "relations",
  nested = "nested",
  tabs = "tabs",
}

export const blockEditTabOptions = [
  { value: BlockEditTab.main, label: "Основное" },
  { value: BlockEditTab.parameters, label: "Свойства" },
  { value: BlockEditTab.relations, label: "Связи" },
  { value: BlockEditTab.nested, label: "Вложенные" },
  { value: BlockEditTab.tabs, label: "Вкладки" },
];
