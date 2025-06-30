import { BlockAbstractDb } from "@/entities/BlockAbstractDb";
import { IUserDocPage } from "@/entities/ConstructorEntities";
import { generateUUID } from "@/utils/UUIDUtils";

const getByUuid = async (db: BlockAbstractDb, uuid: string) => {
  return db.userDocPages.where("uuid").equals(uuid).first();
};

const getAll = async (db: BlockAbstractDb) => {
  return db.userDocPages.toArray();
};

const create = async (db: BlockAbstractDb, page: IUserDocPage) => {
  const data: IUserDocPage = {
    ...page,
    uuid: page.uuid || generateUUID(),
  };
  const id = await db.userDocPages.add(data);
  return { ...data, id };
};

const update = async (db: BlockAbstractDb, page: IUserDocPage) => {
  if (!page.id) {
    const existing = await getByUuid(db, page.uuid!);
    if (existing) page.id = existing.id;
  }
  await db.userDocPages.put(page);
  return page;
};

const save = async (db: BlockAbstractDb, page: IUserDocPage) => {
  if (!page.uuid) {
    return create(db, page);
  }
  const existing = await getByUuid(db, page.uuid);
  if (existing) {
    return update(db, { ...existing, ...page });
  }
  return create(db, page);
};

const remove = async (db: BlockAbstractDb, uuid: string) => {
  await db.userDocPages.where("uuid").equals(uuid).delete();
};

export const UserDocRepository = {
  getByUuid,
  getAll,
  create,
  update,
  save,
  remove,
};
