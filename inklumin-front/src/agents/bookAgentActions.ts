import { bookDb } from "@/entities/bookDb";
import { IBlockParameterInstance } from "@/entities/BookEntities";
import { IBlockParameterDataType } from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { ConfigurationRepository } from "@/repository/ConfigurationRepository";

export const createBlock = async ({
  title,
  description,
  structureKind,
}: {
  title: string;
  description?: string;
  structureKind: string;
}) => {
  const config = await ConfigurationRepository.getFirst(bookDb);
  const block = {
    title,
    description: description || "",
    configurationUuid: config?.uuid,
    structureKind,
  } as any;
  await BlockRepository.save(bookDb, block, true);
  return block;
};

export const createBlockInstance = async ({
  blockUuid,
  title,
  description,
}: {
  blockUuid: string;
  title: string;
  description?: string;
}) => {
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

export const saveParamInstance = async ({
  id,
  blockInstanceUuid,
  blockParameterUuid,
  blockParameterGroupUuid,
  value,
}: {
  id?: number;
  blockInstanceUuid?: string;
  blockParameterUuid?: string;
  blockParameterGroupUuid?: string;
  value: string | number;
}) => {
  if (id) {
    const instance = await BlockParameterInstanceRepository.getById(bookDb, id);
    if (instance) {
      const paramDef = await BlockParameterRepository.getByUuid(
        bookDb,
        instance.blockParameterUuid
      );
      const changes: Partial<IBlockParameterInstance> = {};
      if (paramDef?.dataType === IBlockParameterDataType.blockLink) {
        changes.linkedBlockInstanceUuid = value as string;
      } else {
        changes.value = value;
      }
      await BlockParameterInstanceRepository.updateParameterInstance(bookDb, Number(id), changes);
    }
    return await BlockParameterInstanceRepository.getById(bookDb, id);
  }
  if (!blockInstanceUuid || !blockParameterUuid || !blockParameterGroupUuid) {
    return null;
  }
  const paramDef = await BlockParameterRepository.getByUuid(bookDb, blockParameterUuid);
  const instance = {
    uuid: crypto.randomUUID(),
    blockInstanceUuid,
    blockParameterUuid,
    blockParameterGroupUuid,
    value: paramDef?.dataType === IBlockParameterDataType.blockLink ? "" : value,
    linkedBlockUuid:
      paramDef?.dataType === IBlockParameterDataType.blockLink ? (value as string) : undefined,
  } as any;
  await BlockParameterInstanceRepository.addParameterInstance(bookDb, instance);
  return instance;
};
