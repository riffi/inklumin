import { BookDB } from "@/entities/bookDb";
import { IBook } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { IBookConfiguration } from "@/entities/ConstructorEntities";
import { updateBookLocalUpdatedAt, updateBookSyncState } from "@/utils/bookSyncUtils";

export type BookDbLike = typeof configDatabase | BookDB;
const getByUuid = async (
  db: BookDbLike = configDatabase,
  uuid: string
): Promise<IBook | undefined> => {
  return db.books.where("uuid").equals(uuid).first();
};

const getAll = async (db: BookDbLike = configDatabase): Promise<IBook[]> => {
  return db.books.toArray();
};

const create = async (db: BookDbLike = configDatabase, book: IBook): Promise<void> => {
  await db.books.add(book);
};

const update = async (
  db: BookDbLike = configDatabase,
  uuid: string,
  data: Partial<IBook>
): Promise<void> => {
  await db.books.where("uuid").equals(uuid).modify(data);
  //await updateBookSyncState(uuid, 'localChanges')
};

const remove = async (db: BookDbLike = configDatabase, uuid: string): Promise<void> => {
  await db.books.where("uuid").equals(uuid).delete();
};

const getConfiguration = async (
  db: BookDbLike = configDatabase,
  uuid: string
): Promise<IBookConfiguration | undefined> => {
  return db.bookConfigurations.where("uuid").equals(uuid).first();
};

const addConfiguration = async (
  db: BookDbLike,
  config: IBookConfiguration
): Promise<void> => {
  await db.bookConfigurations.add(config);
};

export const BookRepository = {
  getByUuid,
  getAll,
  create,
  update,
  remove,
  getConfiguration,
  addConfiguration,
};
