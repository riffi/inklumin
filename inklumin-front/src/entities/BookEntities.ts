import { IBlock, IIcon } from "@/entities/ConstructorEntities";

export interface IBook {
  id?: number;
  uuid: string;
  title: string; // Название произведения
  author: string; // Автор произведения
  form: string; // Форма произведения
  genre: string; // Жанр произведения
  configurationUuid: string; // Ссылка на конфигурацию
  configurationTitle: string; // Название конфигурации
  cover?: string;
  kind?: string;
  chapterOnlyMode?: number;
  /** Включить базовую проверку орфографии */
  useSimplePunctuationChecker?: number;
  description?: string;
  localUpdatedAt?: string;
  serverUpdatedAt?: string;
  syncState?: "localChanges" | "serverChanges" | "synced";
}

export interface IBlockInstance {
  id?: number;
  uuid?: string;
  blockUuid: string; // Ссылка на блок, экземпляр которого мы создаем
  title: string; // Название экземпляра блока
  hostInstanceUuid?: string; // Ссылка на родительский экземпляр блока
  parentInstanceUuid?: string; // Ссылка на родительский экземпляр внутри того же блока
  description?: string; // Краткое описание экземпляра блока
  icon?: IIcon;
  updatedAt?: string;
  blockInstanceGroupUuid?: string; // Ссылка на группу экземпляров
}

export interface IBlockInstanceGroup {
  id?: number;
  uuid?: string;
  blockUuid: string; // Ссылка на блок
  title: string;
  order: number;
}

export interface IBlockInstanceSceneLink {
  id?: number;
  uuid?: string;
  blockInstanceUuid: string; // Ссылка на экземпляр блока, который мы хотим связать с сценой
  blockUuid: string; // Ссылка на блок, который будет связан с сценой
  sceneId: number; // Ссылка на сцену
  title?: string; // Title from entity description
}

export interface IBlockParameterInstance {
  id?: number;
  uuid?: string;
  blockInstanceUuid: string; // Ссылка на экземпляр блока, к которому привязан параметр
  blockParameterUuid: string; // Ссылка на параметр блока
  blockParameterGroupUuid: string; // Ссылка на группу параметров блока, к которой принадлежит параметр
  value: string | number; // Значение параметра
  linkedBlockInstanceUuid?: string; // UUID связанного экземпляра блока
}

export interface IScene {
  id?: number;
  title: string; // Название сцены
  body: string; // Тело сцены
  order?: number; // Порядковый номер сцены
  chapterId?: number; // Ссылка на главу, к которой привязана сцена
  totalSymbolCountWithSpaces?: number; // Символов в сцене с пробелами
  totalSymbolCountWoSpaces?: number; // Символов в сцене без пробелов
}

export interface ISceneBody {
  id?: number;
  sceneId: number;
  body: string;
}

export interface ISceneWithInstancesBlock {
  block: IBlock;
  instances: IBlockInstance[];
}
export interface ISceneWithInstances extends IScene {
  blockInstances: ISceneWithInstancesBlock[];
}

export interface IChapter {
  id?: number;
  title: string;
  order: number;
  contentSceneId?: number;
}

export interface IBlockInstanceRelation {
  id?: number;
  uuid?: string;
  sourceInstanceUuid: string; // UUID исходного экземпляра блока
  targetInstanceUuid: string; // UUID целевого экземпляра блока
  sourceBlockUuid: string; // UUID исходного блока
  targetBlockUuid: string; // UUID целевого блока
  blockRelationUuid: string; // Ссылка на исходную связь между блоками
}

export interface INoteGroup {
  id?: number;
  uuid?: string;
  title: string;
  order?: number;
  parentUuid?: string;
  kindCode?: string; // Added this line
}

export interface INote {
  id?: number;
  uuid?: string;
  title: string;
  tags: string;
  body: string;
  order?: number;
  noteGroupUuid?: string;
  bookUuid?: string;
  updatedAt?: string;
}

export interface INotesMeta {
  id?: number;
  localUpdatedAt?: string;
  serverUpdatedAt?: string;
  syncState?: "localChanges" | "serverChanges" | "synced";
}
