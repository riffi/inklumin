import { useLiveQuery } from "dexie-react-hooks";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance, IBlockParameterInstance } from "@/entities/BookEntities";
import {
  IBlock,
  IBlockParameter,
  IBlockParameterGroup,
  IBlockParameterPossibleValue,
  IBlockRelation,
  IBlockTab,
  IIcon,
} from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository"; // Added
import { BlockRelationRepository } from "@/repository/Block/BlockRelationRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockTabRepository } from "@/repository/Block/BlockTabRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";

export const useBlockInstanceEditor = (
  blockInstanceUuid: string,
  currentParamGroup: IBlockParameterGroup | null
) => {
  //реализация блока
  const blockInstance = useLiveQuery<IBlockInstance>(() => {
    return BlockInstanceRepository.getByUuid(bookDb, blockInstanceUuid);
  }, [blockInstanceUuid]);

  const block = useLiveQuery(() => {
    if (!blockInstance) return null;
    return BlockRepository.getByUuid(bookDb, blockInstance?.blockUuid);
  }, [blockInstance]);

  const blockRelations = useLiveQuery<IBlockRelation[]>(async () => {
    if (!block) return [];
    return BlockRelationRepository.getBlockRelations(bookDb, block.uuid);
  }, [block]);

  const relatedBlocks = useLiveQuery<IBlock[]>(() => {
    if (!block || !blockRelations) return [];
    return BlockRelationRepository.getRelatedBlocks(bookDb, block, blockRelations); // Changed to BlockRelationRepository
  }, [block, blockRelations]);

  const allBlocks = useLiveQuery<IBlock[]>(async () => {
    if (!blockInstance) return [];
    return BlockRepository.getAll(bookDb);
  }, [blockInstance]);

  const referencingParams = useLiveQuery<IBlockParameter[]>(() => {
    if (!block || !blockRelations) return [];
    return bookDb.blockParameters.where("relatedBlockUuid").equals(block.uuid).toArray();
  }, [block, blockRelations]);

  //группы параметров блока
  const parameterGroups = useLiveQuery<IBlockParameterGroup[]>(() => {
    if (!blockInstance) return [];
    return BlockParameterRepository.getParameterGroups(bookDb, blockInstance?.blockUuid); // Changed to BlockParameterRepository
  }, [blockInstance]);

  const blockTabs = useLiveQuery<IBlockTab[]>(() => {
    if (!block) return [];
    return BlockTabRepository.getBlockTabs(bookDb, block.uuid);
  }, [block]);

  //значения параметров группы
  const parameterInstances = useLiveQuery<IBlockParameterInstance[]>(() => {
    if (!blockInstance || !currentParamGroup) return [];
    return bookDb.blockParameterInstances
      .where({
        blockParameterGroupUuid: currentParamGroup?.uuid,
        blockInstanceUuid: blockInstance?.uuid,
      })
      .toArray();
  }, [currentParamGroup, blockInstance]);

  //все доступные параметры в группе параметров блока
  const availableParameters = useLiveQuery<IBlockParameter[]>(() => {
    if (!blockInstance || !currentParamGroup) return [];
    return BlockParameterRepository.getParamsByGroup(bookDb, currentParamGroup?.uuid); // Changed to BlockParameterRepository
  }, [currentParamGroup, blockInstance]);

  const possibleValuesMap = useLiveQuery<Record<string, IBlockParameterPossibleValue[]>>(() => {
    if (!availableParameters) return {};
    const paramUuids = availableParameters.map((p) => p.uuid || "");
    return bookDb.blockParameterPossibleValues
      .where("parameterUuid")
      .anyOf(paramUuids)
      .toArray()
      .then((values) => {
        return values.reduce(
          (acc, value) => {
            const key = value.parameterUuid;
            if (!acc[key]) acc[key] = [];
            acc[key].push(value);
            return acc;
          },
          {} as Record<string, IBlockParameterPossibleValue[]>
        );
      });
  }, [availableParameters]);

  //параметры, которые еще не используются в данном блоке
  const availableParametersWithoutInstances = useLiveQuery<IBlockParameter[]>(() => {
    if (!availableParameters) return []; // No parameters available at all
    if (!parameterInstances) return availableParameters; // No instances exist yet, all are available

    return availableParameters.filter((param) => {
      // If allowMultiple is true (1), it's always available for adding another instance.
      if (param.allowMultiple === 1) {
        return true;
      }
      // If allowMultiple is false (0 or undefined), it's available only if no instance of it exists.
      const instanceExists = parameterInstances.some((pi) => pi.blockParameterUuid === param.uuid);
      return !instanceExists;
    });
  }, [availableParameters, parameterInstances]);

  const childBlocks = useLiveQuery<IBlock[]>(() => {
    if (!block) return [];
    return BlockRepository.getChildren(bookDb, block.uuid);
  }, [block]);

  const childInstancesMap = useLiveQuery<Record<string, IBlockInstance[]>>(async () => {
    const result: Record<string, IBlockInstance[]> = {};
    if (!childBlocks) return result;

    await Promise.all(
      childBlocks.map(async (childBlock) => {
        result[childBlock.uuid] = await BlockInstanceRepository.getChildInstances(
          bookDb,
          blockInstance?.uuid,
          childBlock.uuid
        );
      })
    );

    return result;
  }, [childBlocks]);

  const updateBlockInstanceTitle = async (newTitle: string) => {
    if (!blockInstance) return;
    await BlockInstanceRepository.updateByInstanceUuid(bookDb, blockInstance.uuid, {
      title: newTitle,
    });
  };

  const updateBlockInstanceShortDescription = async (newDescription: string) => {
    if (!blockInstance) return;
    await BlockInstanceRepository.updateByInstanceUuid(bookDb, blockInstance.uuid, {
      shortDescription: newDescription,
    });
  };

  const updateBlockInstanceIcon = async (icon: IIcon | undefined) => {
    // Changed to IIcon | undefined
    if (!blockInstance) return;
    await BlockInstanceRepository.updateByInstanceUuid(bookDb, blockInstance.uuid, { icon: icon });
  };

  return {
    blockInstance,
    block,
    parameterGroups,
    parameterInstances,
    availableParametersWithoutInstances,
    availableParameters,
    updateBlockInstanceTitle,
    possibleValuesMap,
    relatedBlocks,
    allBlocks,
    blockRelations,
    childBlocks,
    childInstancesMap,
    blockTabs,
    referencingParams,
    updateBlockInstanceShortDescription,
    updateBlockInstanceIcon,
  };
};
