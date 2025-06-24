import { bookDb } from "@/entities/bookDb";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";

export const createBlock = async ({ title, description, structureKind }: { title: string; description?: string; structureKind: string; }) => {
  const config = await bookDb.bookConfigurations.toCollection().first();
  const block = {
    title,
    description: description || "",
    configurationUuid: config?.uuid,
    structureKind,
  } as any;
  await BlockRepository.save(bookDb, block, true);
  return block;
};

export const createBlockInstance = async ({ blockUuid, title, description }: { blockUuid: string; title: string; description?: string; }) => {
  console.log('createBlockInstance', blockUuid, title, description)
  const instance = {
    uuid: crypto.randomUUID(),
    blockUuid,
    title,
    description,
  } as any;
  await BlockInstanceRepository.create(bookDb, instance);
  await BlockParameterInstanceRepository.appendDefaultParams(bookDb, instance);
  return instance;
};

export const saveParamInstance = async ({ id, blockInstanceUuid, blockParameterUuid, blockParameterGroupUuid, value }: { id?: number; blockInstanceUuid?: string; blockParameterUuid?: string; blockParameterGroupUuid?: string; value: string | number; }) => {
  if (id) {
    await BlockParameterInstanceRepository.updateParameterInstance(bookDb, Number(id), { value });
    return await bookDb.blockParameterInstances.get(id);
  }
  if (!blockInstanceUuid || !blockParameterUuid || !blockParameterGroupUuid) return null;
  const instance = {
    uuid: crypto.randomUUID(),
    blockInstanceUuid,
    blockParameterUuid,
    blockParameterGroupUuid,
    value,
  } as any;
  await BlockParameterInstanceRepository.addParameterInstance(bookDb, instance);
  return instance;
};
