// useBlockRelationsEditor.ts
import { useLiveQuery } from "dexie-react-hooks";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance, IBlockInstanceRelation } from "@/entities/BookEntities";
import { IBlock } from "@/entities/ConstructorEntities";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import {
  BlockInstanceRelationRepository,
  getInstanceRelations,
} from "@/repository/BlockInstance/BlockInstanceRelationRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { generateUUID } from "@/utils/UUIDUtils";

export const useBlockRelationsEditor = (
    blockInstanceUuid: string,
    relatedBlock: IBlock,
    isRelatedBlockTarget: boolean,
    isRelatedBlockNested: boolean,
    hostInstanceUuid: string,
    blockUuid: string
) => {
  const relatedParentInstances = useLiveQuery(
    () =>
      isRelatedBlockNested
        ? BlockInstanceRepository.getBlockInstances(bookDb, relatedBlock.hostBlockUuid!)
        : Promise.resolve([]),
    [relatedBlock, isRelatedBlockNested]
  );

  const relatedParentBlock = useLiveQuery(
    () =>
      isRelatedBlockNested
        ? BlockRepository.getByUuid(bookDb, relatedBlock.hostBlockUuid!)
        : Promise.resolve(null),
    [relatedBlock, isRelatedBlockNested]
  );

  const relatedNestedInstances = useLiveQuery(
    () =>
      hostInstanceUuid
        ? BlockInstanceRepository.getChildInstances(bookDb, hostInstanceUuid)
        : Promise.resolve([]),
    [hostInstanceUuid]
  );

  const instanceRelations = useLiveQuery(
    () =>
      BlockInstanceRelationRepository.getInstanceRelations(
        bookDb,
        blockInstanceUuid,
        relatedBlock.uuid
      ),
    [blockInstanceUuid, relatedBlock.uuid]
  );

  const allRelatedInstances = useLiveQuery(
    () => BlockInstanceRepository.getBlockInstances(bookDb, relatedBlock.uuid),
    [relatedBlock.uuid]
  );

  const isInstanceInRelation = (instance: IBlockInstance, relation: IBlockInstanceRelation) =>
    isRelatedBlockTarget
      ? relation.targetInstanceUuid === instance.uuid
      : relation.sourceInstanceUuid === instance.uuid;

  const unusedRelatedInstances =
    allRelatedInstances?.filter(
      (instance) => !instanceRelations?.some((relation) => isInstanceInRelation(instance, relation))
    ) || [];

  const createBlockInstanceRelation = async (
    targetInstanceUuid: string,
    blockRelationUuid: string
  ) => {
    const [source, target] = isRelatedBlockTarget
      ? [blockInstanceUuid, targetInstanceUuid]
      : [targetInstanceUuid, blockInstanceUuid];

    const sourceBlockUuid = isRelatedBlockTarget ? blockUuid : relatedBlock.uuid;
    const targetBlockUuid = isRelatedBlockTarget ? relatedBlock.uuid : blockUuid;
    await BlockInstanceRelationRepository.createRelation(
      bookDb,
      source,
      target,
      sourceBlockUuid,
      targetBlockUuid,
      blockRelationUuid
    );
  };

  return {
    relatedParentInstances,
    relatedParentBlock,
    relatedChildInstances: relatedNestedInstances,
    instanceRelations,
    allRelatedInstances,
    unusedRelatedInstances,
    isInstanceInRelation,
    createBlockInstanceRelation,
  };
};
