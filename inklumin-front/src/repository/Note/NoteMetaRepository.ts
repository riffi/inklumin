import moment from "moment";
import { INotesMeta } from "@/entities/BookEntities";
import { configDatabase } from "@/entities/configuratorDb";

const getMeta = async (): Promise<INotesMeta | undefined> => {
  return configDatabase.notesMeta.get(1);
};

const updateMeta = async (data: Partial<INotesMeta>) => {
  const existing = (await getMeta()) || { id: 1, syncState: "synced" };
  await configDatabase.notesMeta.put({ ...existing, ...data, id: 1 });
};

const updateLocalChange = async () => {
  await updateMeta({
    localUpdatedAt: moment().toISOString(true),
    syncState: "localChanges",
  });
};

export const NoteMetaRepository = {
  getMeta,
  updateMeta,
  updateLocalChange,
};
