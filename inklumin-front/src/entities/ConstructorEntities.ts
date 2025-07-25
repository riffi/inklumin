export enum IBlockParameterDataType {
  string = "string",
  text = "text",
  checkbox = "checkbox",
  datePicker = "datePicker",
  colorPicker = "colorPicker",
  dropdown = "dropdown",
  blockLink = "blockLink",
}

export enum IBlockParameterDataTypeTitle {
  string = "Строка",
  text = "Текст",
  checkbox = "Галочка",
  datePicker = "Дата",
  colorPicker = "Цвет",
  dropdown = "Выпадающий список",
  blockLink = "Связь c блоком",
}

export enum IBlockStructureKind {
  single = "single",
  multiple = "multiple",
}

export enum IBlockStructureKindTitle {
  single = "Одиночный",
  multiple = "Множественный",
}

export enum IBlockDisplayKind {
  list = "list",
  timeLine = "timeLine",
}

export enum IBlockDisplayKindTitle {
  list = "Список",
  timeLine = "Временная линия",
}

export interface IBookConfiguration {
  id?: number;
  uuid?: string; // Автогенерация UUID
  title: string; // Название конфигурации
  description: string; // Описание конфигурации
}

export interface IBlockTitleForms {
  nominative: string; // Именительный
  genitive: string; // Родительный
  dative: string; // Дательный
  accusative: string; // Винительный
  instrumental: string; // Творительный
  prepositional: string; // Предложный
  plural: string; // Множественное число
}
export enum IIconKind {
  gameIcons = "gameIcons",
  custom = "custom",
}
export interface IIcon {
  iconKind: string; // Тип иконки
  iconName: string; // Имя иконки из набора
  iconBase64?: string; // Кастомная иконка в формате base64
}

// Строительный блок
export interface IBlock {
  id?: number;
  uuid?: string; // Автогенерация UUID
  title: string; // Название блока
  configurationUuid: string; // Ссылка на конфигурацию
  description: string; // Описание блока
  useTabs: number; // Использовать вкладки
  useGroups: number; // Группировать элементы
  structureKind: string; // Вид структуры
  displayKind: string; // Вид отображения
  hostBlockUuid?: string; // Ссылка на хост блок
  titleForms?: IBlockTitleForms; // Формы названия
  sceneLinkAllowed: number; // Разрешено ли создавать связи со сценами
  icon?: IIcon; // Иконка
  customIconBase64?: string; // Кастомная иконка в формате base64
  showInSceneList: number; // Отображать ли в списке сцен
  showInMainMenu: number;
  treeView: number; // Отображать экземпляры в виде дерева
  showBigHeader: number; // Показывать крупный заголовок на мобильных
  userDocPageUuid?: string; // Ссылка на страницу базы знаний
}

export interface IBlockParameterGroup {
  id?: number;
  uuid?: string; // Автогенерация UUID
  title: string; // Название группы параметров
  blockUuid: string; // Ссылка на блок
  description: string; // Описание группы
  orderNumber: number; // Порядковый номер
}

// Тип параметра строительного блока
export interface IBlockParameter {
  id?: number;
  uuid?: string; // Автогенерация UUID
  title: string; // Название параметра
  groupUuid: string; // Ссылка на группу параметров
  blockUuid: string; // Ссылка на блок
  description: string; // Описание
  dataType: string; // Вид данных
  linkedBlockUuid?: string; // Ссылка на связанный блок
  isDefault?: number; // Добавлять параметр по умолчанию
  displayInCard: number; // Отображать ли параметр в карточке
  orderNumber: number; // Порядковый номер
  allowMultiple?: number;
  useForInstanceGrouping?: number;
  userDocPageUuid?: string; // Ссылка на страницу базы знаний
}

export interface IBlockParameterWithBlockTitle extends IBlockParameter {
  blockTitle: string; // Название блока
}

// Возможные значения параметра для типа "выбор из списка"
export interface IBlockParameterPossibleValue {
  id?: number;
  uuid?: number; // Автоматически генерируется
  parameterUuid: string; // Ссылка на IBlockParameterType.uuid
  value: string; // Значение
  orderNumber: number; // Порядковый номер
}

export enum BlockRelationType {
  ONE_TO_ONE = "one-to-one",
  ONE_TO_MANY = "one-to-many",
  MANY_TO_ONE = "many-to-one",
  MANY_TO_MANY = "many-to-many",
}

export interface IBlockRelation {
  id?: number;
  uuid?: string;
  sourceBlockUuid: string; // UUID исходного блока
  targetBlockUuid: string; // UUID целевого блока
  relationType: BlockRelationType; // Тип связи
  configurationUuid: string; // Версия конфигурации
}

export enum IBlockTabKind {
  parameters = "parameters",
  relation = "relation",
  nestedBlock = "nestedBlock",
  referencingParam = "referencingParam",
  scenes = "scenes",
}
export interface IBlockTab {
  id?: number;
  uuid?: string; // Автоматически генерируется
  title: string; // Заголовок вкладки
  orderNumber: number; // Порядковый номер
  blockUuid: string; // Ссылка на строительный блок
  tabKind: string; // Вид вкладки
  relationUuid?: string; // Ссылка на связь
  nestedBlockUuid?: string; // Ссылка на вложенный блок
  referencingParamUuid?: string; // Ссылка на ссылающийся параметр
  isDefault: number; // Является ли вкладка вкладкой по умолчанию
}

export interface IGlobalSettings {
  openRouterKey: string;
  incLuminApiKey: string;
  currentOpenRouterModel: string;
}

export interface IOpenRouterModel {
  modelName: string;
}

export interface IUserDocPage {
  id?: number;
  uuid?: string;
  title: string;
  markdown: string;
  configurationUuid?: string;
  bookUuid?: string;
}
