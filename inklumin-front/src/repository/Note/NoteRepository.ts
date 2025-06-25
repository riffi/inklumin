import moment from "moment";
import { INote } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb"; // Removed ConfigDatabase import

const save = async (db: typeof configDatabase, note: INote) => {
  // Changed type to typeof configDatabase
  const dataToSave = { ...note };
  dataToSave.updatedAt = moment().toISOString(true);
  if (!note.id) {
    return await db.notes.add(dataToSave);
  }
  return await db.notes.put(dataToSave);
};

const getByUuid = async (db: typeof configDatabase, uuid: string) => {
  // Changed type to typeof configDatabase
  return await db.notes.where("uuid").equals(uuid).first();
};

const remove = async (db: typeof configDatabase, uuid: string) => {
  // Changed type to typeof configDatabase
  return await db.notes.where("uuid").equals(uuid).delete();
};

const getByGroup = async (db: typeof configDatabase, groupUuid: string) => {
  return db.notes.where("noteGroupUuid").equals(groupUuid).toArray();
};

const getAll = async (db: typeof configDatabase) => {
  return db.notes.toArray();
};

const getAllByBook = async (db: typeof configDatabase, bookUuid: string) => {
  return db.notes.where("bookUuid").equals(bookUuid).toArray();
};

const clear = async (db: typeof configDatabase) => {
  await db.notes.clear();
};

const bulkAdd = async (db: typeof configDatabase, notes: INote[]) => {
  if (notes && notes.length > 0) {
    await db.notes.bulkAdd(notes);
  }
};

const count = async (db: typeof configDatabase) => db.notes.count();

export const NoteRepository = {
  save,
  getByUuid,
  remove,
  getByGroup,
  getAll,
  getAllByBook,
  clear,
  bulkAdd,
  count,
};
