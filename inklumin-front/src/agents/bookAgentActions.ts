import { bookDb } from "@/entities/bookDb";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { IBlockParameterDataType } from "@/entities/ConstructorEntities";
import { IBlockParameterInstance } from "@/entities/BookEntities";

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
    const instance = await bookDb.blockParameterInstances.get(id);
    if (instance) {
      const paramDef = await bookDb.blockParameters.get({ uuid: instance.blockParameterUuid });
      const changes: Partial<IBlockParameterInstance> = {};
      if (paramDef?.dataType === IBlockParameterDataType.blockLink) {
        changes.linkedBlockUuid = value as string;
      } else {
        changes.value = value;
      }
      await BlockParameterInstanceRepository.updateParameterInstance(bookDb, Number(id), changes);
    }
    return await bookDb.blockParameterInstances.get(id);
  }
  if (!blockInstanceUuid || !blockParameterUuid || !blockParameterGroupUuid) return null;
  const paramDef = await bookDb.blockParameters.get({ uuid: blockParameterUuid });
  const instance = {
    uuid: crypto.randomUUID(),
    blockInstanceUuid,
    blockParameterUuid,
    blockParameterGroupUuid,
    value: paramDef?.dataType === IBlockParameterDataType.blockLink ? "" : value,
    linkedBlockUuid: paramDef?.dataType === IBlockParameterDataType.blockLink ? (value as string) : undefined,
  } as any;
  await BlockParameterInstanceRepository.addParameterInstance(bookDb, instance);
  return instance;
};
