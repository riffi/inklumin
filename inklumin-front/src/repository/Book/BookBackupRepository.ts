import { connectToBookDatabase, deleteBookDatabase } from "@/entities/bookDb";
import { configDatabase } from "@/entities/configuratorDb";
import { BookRepository } from "@/repository/Book/BookRepository";
import { ChapterRepository } from "@/repository/Scene/ChapterRepository";
import { SceneRepository } from "@/repository/Scene/SceneRepository";
import { BlockInstanceSceneLinkRepository } from "@/repository/BlockInstance/BlockInstanceSceneLinkRepository";

export interface BackupData {
  book: any;
  scenes: any[];
  sceneBodies: any[];
  chapters: any[];
  blockInstances: any[];
  blockParameterInstances: any[];
  blockInstanceRelations: any[];
  bookConfigurations: any[];
  blocks: any[];
  blockParameterGroups: any[];
  blockParameters: any[];
  blockParameterPossibleValues: any[];
  blocksRelations: any[];
  blockTabs: any[];
  blockInstanceSceneLinks: any[];
  blockInstanceGroups: any[];
  knowledgeBasePages: any[];
}

export const collectBookBackupData = async (bookUuid: string): Promise<BackupData> => {
  const bookData = await BookRepository.getByUuid(configDatabase, bookUuid);
  const db = connectToBookDatabase(bookUuid);

  if (!bookData) throw new Error("Книга не найдена");

  return {
    book: { ...bookData, id: undefined },
    scenes: await SceneRepository.getAll(db),
    sceneBodies: await SceneRepository.getAllBodies(db),
    chapters: await ChapterRepository.getAll(db),
    blockInstances: await db.blockInstances.toArray(),
    blockParameterInstances: await db.blockParameterInstances.toArray(),
    blockInstanceRelations: await db.blockInstanceRelations.toArray(),
    bookConfigurations: await db.bookConfigurations.toArray(),
    blocks: await db.blocks.toArray(),
    blockParameterGroups: await db.blockParameterGroups.toArray(),
    blockParameters: await db.blockParameters.toArray(),
    blockParameterPossibleValues: await db.blockParameterPossibleValues.toArray(),
    blocksRelations: await db.blocksRelations.toArray(),
    blockTabs: await db.blockTabs.toArray(),
    blockInstanceSceneLinks: await BlockInstanceSceneLinkRepository.getAllLinks(db),
    blockInstanceGroups: await db.blockInstanceGroups.toArray(),
    knowledgeBasePages: await db.knowledgeBasePages.toArray(),
  };
};

export const importBookData = async (backupData: BackupData): Promise<void> => {
  if (!backupData?.book?.uuid) {
    throw new Error("Неверный формат данных");
  }

  const existingBook = await BookRepository.getByUuid(configDatabase, backupData.book.uuid);
  if (existingBook) {
    await BookRepository.update(configDatabase, existingBook.uuid, { ...backupData.book });
  } else {
    await BookRepository.create(configDatabase, { ...backupData.book });
  }

  await deleteBookDatabase(backupData.book.uuid);
  const db = connectToBookDatabase(backupData.book.uuid);

  await BookRepository.create(db, backupData.book);

  const chapterEntries = backupData.chapters || [];
  let addedChapterIds: number[] = [];
  if (chapterEntries.length > 0) {
    addedChapterIds = (await db.chapters.bulkAdd(
      chapterEntries.map((c) => ({
        title: c.title,
        order: c.order,
        contentSceneId: c.contentSceneId,
      })),
      { allKeys: true }
    )) as number[];
  }

  const chapterOrderToDbIdMap = new Map<number, number>();
  if (chapterEntries.length > 0 && addedChapterIds.length === chapterEntries.length) {
    chapterEntries.forEach((chapter, index) => {
      if (chapter.order !== undefined) {
        chapterOrderToDbIdMap.set(chapter.order, addedChapterIds[index]);
      }
    });
  }

  const scenesToImport = backupData.scenes || [];
  if (scenesToImport.length > 0 && chapterOrderToDbIdMap.size > 0) {
    scenesToImport.forEach((scene) => {
      const originalChapterOrder = scene.chapterId as number;
      const dbChapterId = chapterOrderToDbIdMap.get(originalChapterOrder);
      if (dbChapterId !== undefined) {
        scene.chapterId = dbChapterId;
      } else {
        console.warn(
          `Scene "${scene.title}" (original chapter order: ${originalChapterOrder}) could not be mapped to a chapter DB ID. It will become chapterless.`
        );
        scene.chapterId = undefined;
      }
    });
  }

  const otherPromises = [] as Promise<any>[];
  if (scenesToImport.length > 0) {
    otherPromises.push(db.scenes.bulkAdd(scenesToImport));
  }
  if (backupData.sceneBodies && backupData.sceneBodies.length > 0) {
    otherPromises.push(db.sceneBodies.bulkAdd(backupData.sceneBodies));
  }
  otherPromises.push(db.blockInstances.bulkAdd(backupData.blockInstances || []));
  otherPromises.push(db.blockParameterInstances.bulkAdd(backupData.blockParameterInstances || []));
  otherPromises.push(db.blockInstanceRelations.bulkAdd(backupData.blockInstanceRelations || []));
  otherPromises.push(db.bookConfigurations.bulkAdd(backupData.bookConfigurations || []));
  otherPromises.push(db.blocks.bulkAdd(backupData.blocks || []));
  otherPromises.push(db.blockParameterGroups.bulkAdd(backupData.blockParameterGroups || []));
  otherPromises.push(db.blockParameters.bulkAdd(backupData.blockParameters || []));
  otherPromises.push(db.blockParameterPossibleValues.bulkAdd(backupData.blockParameterPossibleValues || []));
  otherPromises.push(db.blocksRelations.bulkAdd(backupData.blocksRelations || []));
  otherPromises.push(db.blockTabs.bulkAdd(backupData.blockTabs || []));
  otherPromises.push(db.blockInstanceGroups.bulkAdd(backupData.blockInstanceGroups || []));
  otherPromises.push(db.knowledgeBasePages.bulkAdd(backupData.knowledgeBasePages || []));
  otherPromises.push(
    BlockInstanceSceneLinkRepository.bulkAddLinks(db, backupData.blockInstanceSceneLinks || [])
  );

  if (otherPromises.length > 0) {
    await Promise.all(otherPromises);
  }
};

export const getEpubExportData = async (bookUuid: string) => {
  const book = await BookRepository.getByUuid(configDatabase, bookUuid);
  if (!book) throw new Error("Book not found");
  const db = connectToBookDatabase(bookUuid);
  const chapters = await ChapterRepository.getAll(db);
  const scenes = await SceneRepository.getAll(db);
  const sceneBodies = await SceneRepository.getAllBodies(db);
  return { book, chapters, scenes, sceneBodies };
};

export const BookBackupRepository = {
  collectBookBackupData,
  importBookData,
  getEpubExportData,
};
