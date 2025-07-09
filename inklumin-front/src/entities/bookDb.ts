import Dexie from "dexie";
import { baseSchema, BlockAbstractDb } from "@/entities/BlockAbstractDb";
import {
  IBlockInstance,
  IBlockInstanceGroup,
  IBlockInstanceRelation,
  IBlockInstanceSceneLink,
  IBlockParameterInstance,
  IBook,
  IChapter,
  IScene,
  ISceneBody,
} from "@/entities/BookEntities";
import { IUserDocPage } from "@/entities/ConstructorEntities";

const bookSchema = {
  ...baseSchema,
  books:
    "++id, &uuid, title, author, kind, configurationUuid, chapterOnlyMode, useSimplePunctuationChecker, localUpdatedAt, serverUpdatedAt, syncState",
  scenes: "++id, title, order, chapterId",
  chapters: "++id, title, order, contentSceneId",
  sceneBodies: "++id, sceneId",

  blockInstanceGroups: "++id, &uuid, blockUuid, title, order",
  blockInstances: "++id, &uuid, blockUuid, title, hostInstanceUuid, blockInstanceGroupUuid, parentInstanceUuid",
  blockParameterInstances:
    "++id, &uuid, blockParameterUuid, blockInstanceUuid, blockParameterGroupUuid, value, linkedBlockInstanceUuid",
  blockInstanceRelations:
    "++id, &uuid, sourceInstanceUuid, targetInstanceUuid, blockRelationUuid, sourceBlockUuid, targetBlockUuid",
  blockInstanceSceneLinks: "++id, &uuid, blockInstanceUuid, sceneId, blockUuid, title",
};

export class BookDB extends BlockAbstractDb {
  scenes!: Dexie.Table<IScene, number>;
  sceneBodies!: Dexie.Table<ISceneBody, number>;
  books!: Dexie.Table<IBook, number>;
  chapters!: Dexie.Table<IChapter, number>;

  blockInstanceRelations!: Dexie.Table<IBlockInstanceRelation, number>;
  blockInstances!: Dexie.Table<IBlockInstance, number>;
  blockInstanceGroups!: Dexie.Table<IBlockInstanceGroup, number>;
  blockParameterInstances!: Dexie.Table<IBlockParameterInstance, number>;
  blockInstanceSceneLinks!: Dexie.Table<IBlockInstanceSceneLink, number>;
  userDocPages!: Dexie.Table<IUserDocPage, number>;
  constructor(dbName: string) {
    super(dbName);
    this.version(12)
      .stores(bookSchema)
      .upgrade(async (tx) => {
        await tx
          .table("books")
          .toCollection()
          .modify((book) => {
            if (book.chapterOnlyMode === undefined) {
              book.chapterOnlyMode = 1;
            }
            if (book.useSimplePunctuationChecker === undefined) {
              book.useSimplePunctuationChecker = 1;
            }
          });

        const blockLinkParams = await tx
          .table("blockParameters")
          .where("dataType")
          .equals("blockLink")
          .toArray();
        const blockLinkUuids = new Set(blockLinkParams.map((p) => p.uuid));

        await tx
          .table("blockParameterInstances")
          .toCollection()
          .modify((inst) => {
            if (blockLinkUuids.has(inst.blockParameterUuid)) {
              inst.linkedBlockInstanceUuid = inst.value;
            }
          });
        await tx
          .table("blocks")
          .toCollection()
          .modify((block) => {
            if (block.showBigHeader === undefined) {
              block.showBigHeader = 0;
            }
            if (block.treeView === undefined) {
              block.treeView = 0;
            }
          });
      });
  }
}

let db: BookDB;

const connectToBookDatabase = (uuid: string): BookDB => {
  if (db) {
    closeDBConnection(db);
  }
  db = new BookDB(`book_db_${uuid}`);

  db.open();

  return db;
};

const closeDBConnection = (db) => {
  if (db) {
    db.close();
  }
};

const deleteBookDatabase = async (uuid: string): Promise<void> => {
  if (db) {
    db.close();
  }
  const dbName = `book_db_${uuid}`;
  await Dexie.delete(dbName);
};

export { connectToBookDatabase, db as bookDb, deleteBookDatabase };
