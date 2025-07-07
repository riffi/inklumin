import { bookDb, connectToBookDatabase, deleteBookDatabase } from "@/entities/bookDb";
import { IBook } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { IBlock, IBlockStructureKind, IBookConfiguration } from "@/entities/ConstructorEntities";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { BookRepository } from "@/repository/Book/BookRepository";
import { generateUUID } from "@/utils/UUIDUtils";

export interface ServiceResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

async function getBookConfiguration(configurationUuid: string) {
  return BookRepository.getConfiguration(configDatabase, configurationUuid);
}

async function copyParameterPossibleValues(parameterUuid: string) {
  const possibleValues = await BlockRepository.getPossibleValuesByParameter(
    configDatabase,
    parameterUuid
  );
  await BlockRepository.bulkAddPossibleValues(bookDb, possibleValues);
}

async function copyBlockParameters(groupUuid: string) {
  const parameters = await BlockRepository.getParametersByGroup(configDatabase, groupUuid);
  await BlockRepository.bulkAddParameters(bookDb, parameters);
  await Promise.all(parameters.map((p) => copyParameterPossibleValues(p.uuid!)));
}

async function copyBlockParameterGroups(blockUuid: string) {
  const parameterGroups = await BlockRepository.getParameterGroupsByBlock(
    configDatabase,
    blockUuid
  );
  await BlockRepository.bulkAddParameterGroups(bookDb, parameterGroups);
  await Promise.all(parameterGroups.map((g) => copyBlockParameters(g.uuid!)));
}

async function copyBlockTabs(blockUuid: string) {
  const tabs = await BlockRepository.getTabsByBlock(configDatabase, blockUuid);
  await BlockRepository.bulkAddTabs(bookDb, tabs);
}

async function createSingleInstance(block: IBlock) {
  if (block.structureKind === IBlockStructureKind.single) {
    const instance = await BlockInstanceRepository.createSingleInstance(bookDb, block);
    await BlockParameterInstanceRepository.appendDefaultParams(bookDb, instance);
  }
}

async function copyBlocks(oldConfigurationUuid: string, newConfigurationUuid: string) {
  const blocks = await BlockRepository.getBlocksByConfiguration(
    configDatabase,
    oldConfigurationUuid
  );
  blocks.forEach((b) => {
    b.configurationUuid = newConfigurationUuid;
  });
  await BlockRepository.bulkAddBlocks(bookDb, blocks);
  await Promise.all(
    blocks.map((block) =>
      Promise.all([copyBlockParameterGroups(block.uuid!), copyBlockTabs(block.uuid!)])
    )
  );
  await Promise.all(blocks.map((block) => createSingleInstance(block)));
}

async function copyBlockRelations(oldConfigurationUuid: string, newConfigurationUuid: string) {
  const relations = await BlockRepository.getRelationsByConfiguration(
    configDatabase,
    oldConfigurationUuid
  );
  relations.forEach((r) => {
    r.configurationUuid = newConfigurationUuid;
  });
  await BlockRepository.bulkAddRelations(bookDb, relations);
}

async function copyUserDocPages(oldConfigurationUuid: string, newConfigurationUuid: string) {
  const pages = await configDatabase.userDocPages
    .where({ configurationUuid: oldConfigurationUuid })
    .toArray();
  pages.forEach((page) => {
    page.configurationUuid = newConfigurationUuid;
  });
  await bookDb.userDocPages.bulkAdd(pages);
}

async function copyConfigurationToBookDb(configuration: IBookConfiguration, isNew = false) {
  const newConfigurationUuid = generateUUID();
  await BookRepository.addConfiguration(bookDb, { ...configuration, uuid: newConfigurationUuid });
  if (!isNew) {
    await copyBlocks(configuration.uuid!, newConfigurationUuid);
    await copyBlockRelations(configuration.uuid!, newConfigurationUuid);
    await copyUserDocPages(configuration.uuid!, newConfigurationUuid);
  }
  return newConfigurationUuid;
}

async function initBookDb(book: IBook): Promise<ServiceResult> {
  try {
    await connectToBookDatabase(book.uuid);
    let configuration: IBookConfiguration | undefined;
    const isNew = !book.configurationUuid;
    if (book.configurationUuid) {
      configuration = await getBookConfiguration(book.configurationUuid);
      if (!configuration) {
        return { success: false, message: "Конфигурация не найдена" };
      }
    } else {
      configuration = { uuid: "", title: book.title, description: "" };
    }
    const configurationUuid = await copyConfigurationToBookDb(configuration, isNew);
    book.configurationUuid = configurationUuid;
    if (book.chapterOnlyMode === undefined) {
      book.chapterOnlyMode = 1;
    }
    await BookRepository.create(bookDb, book);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function saveBook(book: IBook): Promise<ServiceResult> {
  try {
    if (book.chapterOnlyMode === undefined) {
      book.chapterOnlyMode = 1;
    }
    if (book.uuid) {
      await BookRepository.update(configDatabase, book.uuid, book);
    } else {
      book.uuid = generateUUID();
      const initResult = await initBookDb(book);
      if (!initResult.success) return initResult;
      delete book.id;
      await BookRepository.create(configDatabase, book);
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

async function deleteBook(book: IBook): Promise<ServiceResult> {
  try {
    await BookRepository.remove(configDatabase, book.uuid);
    await deleteBookDatabase(book.uuid);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export const BookService = {
  initBookDb,
  getBookConfiguration,
  copyConfigurationToBookDb,
  copyBlockRelations,
  copyBlocks,
  copyBlockTabs,
  copyBlockParameterGroups,
  copyBlockParameters,
  copyParameterPossibleValues,
  createSingleInstance,
  copyUserDocPages,
  saveBook,
  deleteBook,
};

export type { ServiceResult };
