// Определение базы данных
import Dexie from "dexie";
import { baseSchema, BlockAbstractDb } from "@/entities/BlockAbstractDb";
import { IBook, INote, INoteGroup, INotesMeta } from "@/entities/BookEntities";
import { IGlobalSettings, IOpenRouterModel, IUserDocPage } from "@/entities/ConstructorEntities";

const schema = {
  ...baseSchema,
  books: "++id, &uuid, title, author, kind, configurationUuid, chapterOnlyMode",
  notes: "++id, &uuid, title, tags, noteGroupUuid, bookUuid",
  notesGroups: "++id, &uuid, title, parentUuid, kindCode",
  notesMeta: "id, localUpdatedAt, serverUpdatedAt, syncState",
  globalSettings: "++id",
  openRouterModels: "++id, modelName",
};

class ConfigDatabase extends BlockAbstractDb {
  books!: Dexie.Table<IBook, number>;
  notes!: Dexie.Table<INote, number>;
  notesGroups!: Dexie.Table<INoteGroup, number>;
  notesMeta!: Dexie.Table<INotesMeta, number>;
  globalSettings!: Dexie.Table<IGlobalSettings, number>;
  openRouterModels!: Dexie.Table<IOpenRouterModel, number>;
  userDocPages!: Dexie.Table<IUserDocPage, number>;
  constructor() {
    super("BlocksDatabase");
    this.version(7)
      .stores(schema)
      .upgrade(async (tx) => {
        await tx
          .table("books")
          .toCollection()
          .modify((book) => {
            if (book.chapterOnlyMode === undefined) {
              book.chapterOnlyMode = 1;
            }
          });
        const metaExists = await tx.table("notesMeta").count();
        if (!metaExists) {
          await tx.table("notesMeta").add({ id: 1, syncState: "synced" });
        }
        await tx
          .table("blocks")
          .toCollection()
          .modify((block) => {
            if (block.showBigHeader === undefined) {
              block.showBigHeader = 0;
            }
          });
      });
  }
}

// Экспорт экземпляра базы данных
export const configDatabase = new ConfigDatabase();
