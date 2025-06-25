import { BookDB } from "@/entities/bookDb";
import { IBlockInstance, IBlockParameterInstance } from "@/entities/BookEntities";
import { IBlockParameter, IBlockParameterDataType } from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository";
import { updateBookLocalUpdatedAt } from "@/utils/bookSyncUtils";
import { generateUUID } from "@/utils/UUIDUtils";
import { updateBlockInstance } from "./BlockInstanceUpdateHelper";

export const getInstanceParams = async (db: BookDB, instanceUuid: string) => {
  return db.blockParameterInstances.where("blockInstanceUuid").equals(instanceUuid).toArray();
};

export const getById = async (db: BookDB, id: number) => {
  return db.blockParameterInstances.get(id);
};

export const appendDefaultParam = async (
  db: BookDB,
  instance: IBlockInstance,
  param: IBlockParameter
) => {
  const paramInstance: IBlockParameterInstance = {
    uuid: generateUUID(),
    blockInstanceUuid: instance.uuid!,
    blockParameterUuid: param.uuid!,
    blockParameterGroupUuid: param.groupUuid,
    value: "",
    linkedBlockUuid: param.dataType === IBlockParameterDataType.blockLink ? "" : undefined,
  };
  await db.blockParameterInstances.add(paramInstance);
  await updateBlockInstance(db, instance);
  await updateBookLocalUpdatedAt(db);
};

export const appendDefaultParams = async (db: BookDB, instance: IBlockInstance) => {
  if (!instance.uuid) return;

  const defaultParameters = await BlockParameterRepository.getDefaultParameters(
    db,
    instance.blockUuid
  );
  if (defaultParameters.length === 0) return;

  const paramInstances = defaultParameters.map((param) => ({
    uuid: generateUUID(),
    blockInstanceUuid: instance.uuid!,
    blockParameterUuid: param.uuid!,
    blockParameterGroupUuid: param.groupUuid,
    value: "",
    linkedBlockUuid: param.dataType === IBlockParameterDataType.blockLink ? "" : undefined,
  }));

  await db.blockParameterInstances.bulkAdd(paramInstances);
  await updateBlockInstance(db, instance);
  await updateBookLocalUpdatedAt(db);
};

export const addParameterInstance = async (db: BookDB, instance: IBlockParameterInstance) => {
  await db.blockParameterInstances.add(instance);
  const blockInstance = await db.blockInstances.get({ uuid: instance.blockInstanceUuid });
  if (blockInstance) await updateBlockInstance(db, blockInstance);
  await updateBookLocalUpdatedAt(db);
};

export const updateParameterInstance = async (
  db: BookDB,
  id: number,
  changes: Partial<IBlockParameterInstance>
) => {
  await db.blockParameterInstances.update(id, changes);
  const paramInstance = await db.blockParameterInstances.get(id);
  if (!paramInstance) return;

  const blockInstance = await db.blockInstances.get({ uuid: paramInstance.blockInstanceUuid });
  if (blockInstance) await updateBlockInstance(db, blockInstance);
  await updateBookLocalUpdatedAt(db);
};

export const deleteParameterInstance = async (db: BookDB, id: number) => {
  const paramInstance = await db.blockParameterInstances.get(id);
  if (!paramInstance) return;

  await db.blockParameterInstances.delete(id);
  const blockInstance = await db.blockInstances.get({ uuid: paramInstance.blockInstanceUuid });
  if (blockInstance) await updateBlockInstance(db, blockInstance);
  await updateBookLocalUpdatedAt(db);
};

export const removeAllForInstance = async (db: BookDB, instanceUuid: string) => {
  await Promise.all([
    db.blockParameterInstances.where("blockInstanceUuid").equals(instanceUuid).delete(),
    db.blockParameterInstances.where("linkedBlockUuid").equals(instanceUuid).delete(),
  ]);
  await updateBookLocalUpdatedAt(db);
};

export const getReferencingParamsToInstance = async (db: BookDB, instanceUuid: string) => {
  return db.blockParameterInstances
    .filter((param) => param.linkedBlockUuid === instanceUuid)
    .toArray();
};

export const BlockParameterInstanceRepository = {
  getInstanceParams,
  getById,
  appendDefaultParam,
  appendDefaultParams,
  addParameterInstance,
  updateParameterInstance,
  deleteParameterInstance,
  removeAllForInstance,
  getReferencingParamsToInstance,
};
