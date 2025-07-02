import moment from "moment";
import { INote } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb"; // Removed ConfigDatabase import
import { NoteMetaRepository } from "./NoteMetaRepository";

const save = async (db: typeof configDatabase, note: INote) => {
  // Changed type to typeof configDatabase
  const dataToSave = { ...note };
  dataToSave.updatedAt = moment().toISOString(true);
  let res;
  if (!note.id) {
    res = await db.notes.add(dataToSave);
  } else {
    res = await db.notes.put(dataToSave);
  }
  await NoteMetaRepository.updateLocalChange();
  return res;
};

const getByUuid = async (db: typeof configDatabase, uuid: string) => {
  // Changed type to typeof configDatabase
  return await db.notes.where("uuid").equals(uuid).first();
};

const remove = async (db: typeof configDatabase, uuid: string) => {
  const result = await db.notes.where("uuid").equals(uuid).delete();
  await NoteMetaRepository.updateLocalChange();
  return result;
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
  await NoteMetaRepository.updateLocalChange();
};

const bulkAdd = async (db: typeof configDatabase, notes: INote[]) => {
  if (notes && notes.length > 0) {
    await db.notes.bulkAdd(notes);
    await NoteMetaRepository.updateLocalChange();
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
