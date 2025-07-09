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
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";

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
    return BlockParameterRepository.getReferencingParamsToBlock(bookDb, block.uuid);
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
    return BlockParameterInstanceRepository.getInstanceParams(bookDb, blockInstance.uuid).then(
      (params) => params.filter((p) => p.blockParameterGroupUuid === currentParamGroup?.uuid)
    );
  }, [currentParamGroup, blockInstance]);

  //все доступные параметры в группе параметров блока
  const availableParameters = useLiveQuery<IBlockParameter[]>(() => {
    if (!blockInstance || !currentParamGroup) return [];
    return BlockParameterRepository.getParamsByGroup(bookDb, currentParamGroup?.uuid); // Changed to BlockParameterRepository
  }, [currentParamGroup, blockInstance]);

  const possibleValuesMap = useLiveQuery<Record<string, IBlockParameterPossibleValue[]>>(() => {
    if (!availableParameters) return {};
    return Promise.all(
      availableParameters.map((p) =>
        BlockParameterRepository.getParamPossibleValues(bookDb, p.uuid!).then((values) => ({
          uuid: p.uuid!,
          values,
        }))
      )
    ).then((results) => {
      const map: Record<string, IBlockParameterPossibleValue[]> = {};
      results.forEach((r) => {
        map[r.uuid] = r.values;
      });
      return map;
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

  const nestedBlocks = useLiveQuery<IBlock[]>(() => {
    if (!block) return [];
    return BlockRepository.getChildren(bookDb, block.uuid);
  }, [block]);

  const nestedInstancesMap = useLiveQuery<Record<string, IBlockInstance[]>>(async () => {
    const result: Record<string, IBlockInstance[]> = {};
    if (!nestedBlocks) return result;

    await Promise.all(
      nestedBlocks.map(async (nestedBlock) => {
        result[nestedBlock.uuid] = await BlockInstanceRepository.getChildInstances(
          bookDb,
          blockInstance?.uuid,
          nestedBlock.uuid
        );
      })
    );

    return result;
  }, [nestedBlocks]);

  const updateBlockInstanceTitle = async (newTitle: string) => {
    if (!blockInstance) return;
    await BlockInstanceRepository.updateByInstanceUuid(bookDb, blockInstance.uuid, {
      title: newTitle,
    });
  };

  const updateBlockInstanceDescription = async (newDescription: string) => {
    if (!blockInstance) return;
    await BlockInstanceRepository.updateByInstanceUuid(bookDb, blockInstance.uuid, {
      description: newDescription,
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
    childBlocks: nestedBlocks,
    childInstancesMap: nestedInstancesMap,
    blockTabs,
    referencingParams,
    updateBlockInstanceShortDescription: updateBlockInstanceDescription,
    updateBlockInstanceIcon,
  };
};
