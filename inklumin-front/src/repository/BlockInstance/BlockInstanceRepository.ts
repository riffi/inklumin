import { BookDB } from "@/entities/bookDb";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRelationRepository } from "@/repository/BlockInstance/BlockInstanceRelationRepository";
import { BlockInstanceSceneLinkRepository } from "@/repository/BlockInstance/BlockInstanceSceneLinkRepository";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";
import { generateUUID } from "@/utils/UUIDUtils";
import { updateBlockInstance } from "./BlockInstanceUpdateHelper";
import { BlockParameterInstanceRepository } from "./BlockParameterInstanceRepository";

export const getByUuid = async (db: BookDB, blockInstanceUuid: string) => {
  return db.blockInstances.where("uuid").equals(blockInstanceUuid).first();
};

export const getByUuidList = async (db: BookDB, blockInstanceUuidList: string[]) => {
  return db.blockInstances.where("uuid").anyOf(blockInstanceUuidList).toArray();
};

export const getBlockInstances = async (db: BookDB, blockUuid: string, titleSearch?: string) => {
  let collection = db.blockInstances.where("blockUuid").equals(blockUuid);

  if (titleSearch && titleSearch.trim() !== "") {
    collection = collection.filter((instance) =>
      instance.title.toLowerCase().includes(titleSearch.trim().toLowerCase())
    );
  }

  return collection.toArray();
};

export const getAll = async (db: BookDB) => {
  return db.blockInstances.toArray();
};

export const create = async (db: BookDB, instance: IBlockInstance) => {
  const instanceToCreate = {
    ...instance,
    uuid: instance.uuid || generateUUID(),
    updatedAt: new Date().toISOString(),
  };
  delete (instanceToCreate as any).id;
  await db.blockInstances.add(instanceToCreate);
  await updateBookLocalUpdatedAt(db);
};

export const createSingleInstance = async (
  db: BookDB,
  block: IBlock
): Promise<IBlockInstance | undefined> => {
  const newUuid = generateUUID();
  const newInstanceData: IBlockInstance = {
    uuid: newUuid,
    blockUuid: block.uuid,
    title: block.title || "Unnamed Instance",
  };
  await create(db, newInstanceData);
  await BlockParameterInstanceRepository.appendDefaultParams(db, newInstanceData);
  const created = await getByUuid(db, newUuid);
  await updateBookLocalUpdatedAt(db);
  return created;
};

export const update = async (db: BookDB, instance: IBlockInstance) => {
  await updateBlockInstance(db, instance);
  await updateBookLocalUpdatedAt(db);
};

export const updateByInstanceUuid = async (
  db: BookDB,
  instanceUuid: string,
  newData: Partial<IBlockInstance>
) => {
  const instanceToUpdate = await getByUuid(db, instanceUuid);
  if (!instanceToUpdate) return;

  const mergedData: IBlockInstance = {
    ...instanceToUpdate,
    ...newData,
    updatedAt: new Date().toISOString(),
  };
  await db.blockInstances.update(mergedData.id!, mergedData);
  await updateBookLocalUpdatedAt(db);
};

export const remove = async (db: BookDB, instance: IBlockInstance) => {
  await Promise.all([
    BlockInstanceRelationRepository.removeAllForInstance(db, instance.uuid!),
    BlockParameterInstanceRepository.removeAllForInstance(db, instance.uuid!),
    BlockInstanceSceneLinkRepository.removeLinksForInstance(db, instance.uuid!),
    db.blockInstances.delete(instance.id!),
  ]);
  await updateBookLocalUpdatedAt(db);
};

export const getNestedInstances = async (
  db: BookDB,
  hostInstanceUuid: string,
  nestedBlockUuid?: string
) => {
  const query = db.blockInstances.where("hostInstanceUuid").equals(hostInstanceUuid);

  return nestedBlockUuid
    ? query.filter((i) => i.blockUuid === nestedBlockUuid).toArray()
    : query.toArray();
};

export const removeByBlock = async (db: BookDB, blockUuid: string) => {
  const instances = await getBlockInstances(db, blockUuid);
  for (const instance of instances) {
    await remove(db, instance);
  }
  await updateBookLocalUpdatedAt(db);
};

const updateGroupRecursively = async (
  db: BookDB,
  parentUuid: string,
  groupUuid: string | undefined
) => {
  const children = await db.blockInstances.where("parentInstanceUuid").equals(parentUuid).toArray();
  for (const child of children) {
    await db.blockInstances.update(child.id!, { blockInstanceGroupUuid: groupUuid });
    await updateGroupRecursively(db, child.uuid!, groupUuid);
  }
};

export const moveInstance = async (
  db: BookDB,
  instanceUuid: string,
  newParentUuid: string | null,
  newGroupUuid?: string
) => {
  const inst = await getByUuid(db, instanceUuid);
  if (!inst) return;
  const groupChanged = inst.blockInstanceGroupUuid !== newGroupUuid;
  await db.transaction("rw", db.blockInstances, async () => {
    await db.blockInstances
      .where("uuid")
      .equals(instanceUuid)
      .modify({
        parentInstanceUuid: newParentUuid || undefined,
        blockInstanceGroupUuid: newGroupUuid,
      });
    if (groupChanged) {
      await updateGroupRecursively(db, instanceUuid, newGroupUuid);
    }
  });
  await updateBookLocalUpdatedAt(db);
};

export const BlockInstanceRepository = {
  getByUuid,
  getByUuidList,
  getBlockInstances,
  getAll,
  create,
  createSingleInstance,
  update,
  updateByInstanceUuid,
  remove,
  getNestedInstances,
  removeByBlock,
  moveInstance,
};
