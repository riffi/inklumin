import { notifications } from "@mantine/notifications";
import { InkLuminApiError, InkLuminMlApi } from "@/api/inkLuminMlApi";
import { BlockAbstractDb } from "@/entities/BlockAbstractDb";
// import {useLiveQuery} from "dexie-react-hooks"; // This seems unused
import { BookDB, bookDb } from "@/entities/bookDb";
import {
  IBlock,
  IBlockParameter,
  IBlockParameterDataType,
  IBlockParameterGroup,
  IBlockParameterPossibleValue,
  IBlockRelation,
  IBlockStructureKind,
  IBlockTab,
  IBlockTitleForms,
} from "@/entities/ConstructorEntities";
import { BlockRelationRepository } from "@/repository/Block/BlockRelationRepository";
import {
  BlockInstanceRepository,
  getNestedInstances
} from "@/repository/BlockInstance/BlockInstanceRepository";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";
import { generateUUID } from "@/utils/UUIDUtils";
import { BlockParameterRepository } from "./BlockParameterRepository"; // Added
import { BlockTabRepository } from "./BlockTabRepository"; // Added

const getByUuid = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blocks.where("uuid").equals(blockUuid).first();
};

const getByUuidList = async (db: BlockAbstractDb, blockUuids: string[]) => {
  return db.blocks.where("uuid").anyOf(blockUuids).toArray();
};

const getSiblings = async (db: BlockAbstractDb, block: IBlock) => {
  return db.blocks
    .where({
      configurationUuid: block.configurationUuid,
    })
    .filter((b) => b.uuid !== block.uuid)
    .toArray();
};

const getBlocksByConfiguration = async (db: BlockAbstractDb, configurationUuid: string) => {
  return db.blocks.where({ configurationUuid }).toArray();
};

const bulkAddBlocks = async (db: BlockAbstractDb, blocks: IBlock[]) => {
  await db.blocks.bulkAdd(blocks);
};

const getParameterGroupsByBlock = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockParameterGroups.where({ blockUuid }).toArray();
};

const bulkAddParameterGroups = async (db: BlockAbstractDb, groups: IBlockParameterGroup[]) => {
  await db.blockParameterGroups.bulkAdd(groups);
};

const getParametersByGroup = async (db: BlockAbstractDb, groupUuid: string) => {
  return db.blockParameters.where({ groupUuid }).toArray();
};

const bulkAddParameters = async (db: BlockAbstractDb, params: IBlockParameter[]) => {
  await db.blockParameters.bulkAdd(params);
};

const getPossibleValuesByParameter = async (db: BlockAbstractDb, parameterUuid: string) => {
  return db.blockParameterPossibleValues.where({ parameterUuid }).toArray();
};

const bulkAddPossibleValues = async (
  db: BlockAbstractDb,
  values: IBlockParameterPossibleValue[]
) => {
  await db.blockParameterPossibleValues.bulkAdd(values);
};

const getTabsByBlock = async (db: BlockAbstractDb, blockUuid: string) => {
  return db.blockTabs.where({ blockUuid }).toArray();
};

const bulkAddTabs = async (db: BlockAbstractDb, tabs: IBlockTab[]) => {
  await db.blockTabs.bulkAdd(tabs);
};

const getRelationsByConfiguration = async (db: BlockAbstractDb, configurationUuid: string) => {
  return db.blocksRelations.where({ configurationUuid }).toArray();
};

const bulkAddRelations = async (db: BlockAbstractDb, relations: IBlockRelation[]) => {
  await db.blocksRelations.bulkAdd(relations);
};

// Создание блока
const create = async (
  db: BlockAbstractDb,
  block: IBlock,
  isBookDb = false,
  titleForms?: IBlockTitleForms
) => {
  if (titleForms) {
    block.titleForms = titleForms;
  } else {
    try {
      block.titleForms = await InkLuminMlApi.fetchAndPrepareTitleForms(block.title);
    } catch (error) {
      if (error instanceof InkLuminApiError) {
        throw error; // Re-throw the specific API error
      }
      // Handle other potential errors or re-throw them as generic errors
      throw new Error(`Failed to prepare title forms during block creation: ${error.message}`);
    }
  }
  block.uuid = generateUUID();
  block.showInMainMenu = 1; // Set default value for showInMainMenu
  block.showBigHeader = 0; // Значение по умолчанию для крупного заголовка
  block.treeView = 0; // Значение по умолчанию для древовидного представления
  // Persist knowledge base link if provided
  const blockToSave: IBlock = {
    ...block,
    userDocPageUuid: block.userDocPageUuid ?? undefined,
  };
  const blockId = await db.blocks.add(blockToSave);
  const persistedBlockData = await db.blocks.get(blockId);
  await BlockParameterRepository.appendDefaultParamGroup(db, persistedBlockData); // Updated call
  await BlockTabRepository.appendDefaultTab(db, persistedBlockData); // Updated call

  // Если это книжная БД, создаем инстанс блока
  if (isBookDb && block.structureKind === "single") {
    await BlockInstanceRepository.createSingleInstance(db as BookDB, block);
  }
  if (isBookDb) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
  return block.uuid;
};

// Обновление данных блока
const update = async (
  db: BlockAbstractDb,
  block: IBlock,
  isBookDb = false,
  titleForms?: IBlockTitleForms
) => {
  const prevBlockData = await getByUuid(db, block.uuid);

  // Если переданы titleForms, используем их
  if (titleForms) {
    block.titleForms = titleForms;
  }
  // Если название блока изменилось и titleForms не переданы, пытаемся получить их через API
  else if (prevBlockData && prevBlockData.title !== block.title) {
    try {
      block.titleForms = await InkLuminMlApi.fetchAndPrepareTitleForms(block.title);
    } catch (error) {
      if (error instanceof InkLuminApiError) {
        throw error; // Re-throw the specific API error
      }
      // Handle other potential errors or re-throw them as generic errors
      throw new Error(`Failed to prepare title forms during block update: ${error.message}`);
    }
  }

  // Если блок стал одиночным, а был неодиночным, то создаем инстанс блока, если он не имеет инстансов
  if (
    isBookDb &&
    prevBlockData?.structureKind !== IBlockStructureKind.single &&
    block.structureKind === IBlockStructureKind.single
  ) {
    const nestedInstances = await BlockInstanceRepository.getNestedInstances(
      db as BookDB,
      block.uuid
    );
    if (nestedInstances.length === 0) {
      await BlockInstanceRepository.createSingleInstance(db as BookDB, block);
    }
  }
  const blockToUpdate: IBlock = {
    ...block,
    userDocPageUuid: block.userDocPageUuid ?? undefined,
  };
  db.blocks.update(block.id, blockToUpdate);
  if (isBookDb) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

// Сохранение блока
const save = async (
  db: BlockAbstractDb,
  block: IBlock,
  isBookDb = false,
  titleForms?: IBlockTitleForms
) => {
  try {
    // Создание блока
    if (!block.uuid) {
      await create(db, block, isBookDb, titleForms);
    } else {
      // Обновление блока
      await update(db, block, isBookDb, titleForms);
    }
  } catch (error) {
    if (error instanceof InkLuminApiError) {
      throw error; // Re-throw for UI to handle
    }
    notifications.show({
      title: "Ошибка запроса",
      message: error instanceof Error ? error.message : "Ошибка",
      color: "red",
    });
  }
};

const remove = async (db: BlockAbstractDb, block: IBlock) => {
  // Получаем все группы параметров блока и удаляем их через BlockParameterRepository
  const groups = await BlockParameterRepository.getParameterGroups(db, block.uuid);
  for (const group of groups) {
    if (!group.uuid) continue;
    // deleteParameterGroup handles parameters and their possible values
    await BlockParameterRepository.deleteParameterGroup(db, block.uuid, group.uuid);
  }

  // Удаляем связи блока
  const [sourceRelations, targetRelations] = await Promise.all([
    db.blocksRelations.where("sourceBlockUuid").equals(block.uuid).toArray(),
    db.blocksRelations.where("targetBlockUuid").equals(block.uuid).toArray(),
  ]);
  const allRelations = [...sourceRelations, ...targetRelations];
  for (const relation of allRelations) {
    await BlockRelationRepository.remove(db, relation.uuid);
  }

  //Удаляем вкладки блока
  await BlockTabRepository.deleteTabsForBlock(db, block.uuid); // Updated call

  // Удаляем сам блок
  await db.blocks.where("uuid").equals(block.uuid).delete();
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const getAll = async (db: BlockAbstractDb): Promise<IBlock[]> => {
  return db.blocks.toArray();
};

const unlinkNestedFromParent = async (db: BlockAbstractDb, nestedBlock: IBlock) => {
  await db.blocks.update(nestedBlock.id!, {
    ...nestedBlock,
    hostBlockUuid: null,
    displayKind: "list",
  });
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const linkNestedToHost = async (db: BlockAbstractDb, nestedBlock: IBlock, hostUuid: string) => {
  await db.blocks.update(nestedBlock.id!, {
    ...nestedBlock,
    hostBlockUuid: hostUuid,
  });
  if (db instanceof BookDB) {
    await updateBookLocalUpdatedAt(db as BookDB);
  }
};

const getNested = async (db: BlockAbstractDb, hostBlockUuid: string) => {
  return db.blocks.where("hostBlockUuid").equals(hostBlockUuid).toArray();
};

export const BlockRepository = {
  getAll,
  getByUuid,
  getByUuidList,
  getNested,
  getSiblings,
  getBlocksByConfiguration,
  bulkAddBlocks,
  getParameterGroupsByBlock,
  bulkAddParameterGroups,
  getParametersByGroup,
  bulkAddParameters,
  getPossibleValuesByParameter,
  bulkAddPossibleValues,
  getTabsByBlock,
  bulkAddTabs,
  getRelationsByConfiguration,
  bulkAddRelations,
  save,
  remove,
  unlinkNestedFromParent,
  linkNestedToHost
}
