import { INote, INoteGroup } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";
import { NoteGroupRepository } from "./NoteGroupRepository";
import { NoteMetaRepository } from "./NoteMetaRepository";
import { NoteRepository } from "./NoteRepository";

export interface NotesBackupData {
  notes: INote[];
  groups: INoteGroup[];
  meta: { localUpdatedAt?: string; serverUpdatedAt?: string; syncState?: string };
}

export const collectNotesBackupData = async (): Promise<NotesBackupData> => {
  const notes = await NoteRepository.getAll(configDatabase);
  const groups = await NoteGroupRepository.getAll(configDatabase);
  const meta = (await NoteMetaRepository.getMeta()) || {};
  return { notes, groups, meta };
};

export const importNotesData = async (data: NotesBackupData) => {
  await NoteRepository.clear(configDatabase);
  await NoteGroupRepository.clear(configDatabase);
  await NoteRepository.bulkAdd(configDatabase, data.notes || []);
  await NoteGroupRepository.bulkAdd(configDatabase, data.groups || []);
  await NoteMetaRepository.updateMeta({
    localUpdatedAt: data.meta.serverUpdatedAt,
    serverUpdatedAt: data.meta.serverUpdatedAt,
    syncState: "synced",
  });
};

export const NoteBackupRepository = {
  collectNotesBackupData,
  importNotesData,
};
