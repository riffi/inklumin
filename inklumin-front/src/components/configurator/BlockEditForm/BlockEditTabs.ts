export enum BlockEditTab {
  main = "main",
  parameters = "parameters",
  relations = "relations",
  children = "children",
  tabs = "tabs",
}

export const blockEditTabOptions = [
  { value: BlockEditTab.main, label: "Основное" },
  { value: BlockEditTab.parameters, label: "Свойства" },
  { value: BlockEditTab.relations, label: "Связи" },
  { value: BlockEditTab.children, label: "Дочерние" },
  { value: BlockEditTab.tabs, label: "Вкладки" },
];
