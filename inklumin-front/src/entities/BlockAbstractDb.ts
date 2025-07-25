import Dexie from "dexie";
import {
  IBlock,
  IBlockParameter,
  IBlockParameterGroup,
  IBlockParameterPossibleValue,
  IBlockRelation,
  IBlockTab,
  IBookConfiguration,
  IUserDocPage,
} from "@/entities/ConstructorEntities";

export const baseSchema = {
  bookConfigurations: "++id, &uuid, title",
  blocks:
    "++id, &uuid, configurationUuid, hostBlockUuid, title, sceneLinkAllowed, showInSceneList, showInMainMenu, treeView, showBigHeader, useGroups",
  blockParameterGroups: "++id, &uuid, blockUuid, title",
  blockParameters:
    "++id, &uuid, groupUuid, blockUuid, dataType, linkedBlockUuid, linkedParameterUuid, isDefault, displayInCard, useForInstanceGrouping ",
  blockParameterPossibleValues: "++id, &uuid, parameterUuid, value",
  blocksRelations: "++id, &uuid, sourceBlockUuid, targetBlockUuid, configurationUuid",
  blockTabs: "++id, &uuid, blockUuid, title, relationUuid",
  userDocPages: "++id, &uuid, configurationUuid, bookUuid",
};

export class BlockAbstractDb extends Dexie {
  bookConfigurations!: Dexie.Table<IBookConfiguration, number>;
  blocks!: Dexie.Table<IBlock, number>;
  blockParameterGroups!: Dexie.Table<IBlockParameterGroup, number>;
  blockParameters!: Dexie.Table<IBlockParameter, number>;
  blockParameterPossibleValues!: Dexie.Table<IBlockParameterPossibleValue, number>;
  blocksRelations!: Dexie.Table<IBlockRelation, number>;
  blockTabs!: Dexie.Table<IBlockTab, number>;
  userDocPages!: Dexie.Table<IUserDocPage, number>;

  constructor(dbName: string) {
    super(dbName);
    this.version(5).stores(baseSchema);
  }
}
