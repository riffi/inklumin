import { useLiveQuery } from "dexie-react-hooks";
import { bookDb } from "@/entities/bookDb";
import {
  IBlockInstance,
  IBlockInstanceGroup,
  IBlockParameterInstance,
} from "@/entities/BookEntities";
import { IBlock, IBlockParameter } from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository"; // Added
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceGroupRepository } from "@/repository/BlockInstance/BlockInstanceGroupRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";

export interface IBlockParameterInstanceWithDisplayValue extends IBlockParameterInstance {
  displayValue: string;
}

export interface IBlockInstanceWithParams extends IBlockInstance {
  params: IBlockParameterInstanceWithDisplayValue[];
}

export type TParameterDisplayMode = "inline" | "drawer";

export const useBlockInstanceManager = (blockUuid: string, titleSearch?: string) => {
  const block = useLiveQuery<IBlock>(() => {
    return BlockRepository.getByUuid(bookDb, blockUuid);
  }, [blockUuid]);

  const groups = useLiveQuery<IBlockInstanceGroup[]>(() => {
    return BlockInstanceGroupRepository.getGroups(bookDb, blockUuid);
  }, [blockUuid]);

  const groupingParam = useLiveQuery<IBlockParameter | undefined>(() => {
    return BlockParameterRepository.getGroupingParameter(bookDb, blockUuid);
  }, [blockUuid]);

  const linkGroups = useLiveQuery<IBlockInstance[]>(() => {
    if (!groupingParam?.linkedBlockUuid) return [];
    return BlockInstanceRepository.getBlockInstances(bookDb, groupingParam.linkedBlockUuid);
  }, [groupingParam?.linkedBlockUuid]);

  const instances = useLiveQuery<IBlockInstance[]>(() => {
    if (block && block.uuid !== blockUuid) {
      return undefined;
    }
    return BlockInstanceRepository.getBlockInstances(bookDb, blockUuid, titleSearch);
  }, [blockUuid, titleSearch, block]);

  const displayedParameters = useLiveQuery<IBlockParameter[]>(() => {
    return BlockParameterRepository.getDisplayedParameters(bookDb, blockUuid); // Changed to BlockParameterRepository
  }, [blockUuid]);

  // Измененный код формирования instancesWithParams
  const instancesWithParams = useLiveQuery<IBlockInstanceWithParams[]>(async () => {
    if (!instances || !displayedParameters) return [];

    // Идентификаторы параметров, которые нужно подгрузить для инстансов
    const parameterUuids = [...displayedParameters.map((p) => p.uuid!)];
    if (groupingParam?.uuid && !parameterUuids.includes(groupingParam.uuid)) {
      parameterUuids.push(groupingParam.uuid);
    }

    // Получаем базовые данные
    const instancesWithParams = await Promise.all(
      instances.map(async (instance) => {
        const params = await BlockParameterInstanceRepository.getInstanceParams(
          bookDb,
          instance.uuid
        );
        const filtered = params.filter((p) => parameterUuids.includes(p.blockParameterUuid));
        return { ...instance, params: filtered };
      })
    );

    // Собираем UUID всех связанных блоков для blockLink параметров
    const blockLinkUuids = new Set<string>();
    displayedParameters.forEach((param) => {
      if (param.dataType === "blockLink") {
        instancesWithParams.forEach((instance) => {
          instance.params.forEach((p) => {
            if (p.blockParameterUuid === param.uuid && p.linkedBlockInstanceUuid) {
              blockLinkUuids.add(p.linkedBlockInstanceUuid);
            }
          });
        });
      }
    });

    // Загружаем связанные блоки
    const linkedBlocks = await Promise.all(
      Array.from(blockLinkUuids).map((uuid) => BlockInstanceRepository.getByUuid(bookDb, uuid))
    );

    // Создаем словарь UUID -> title
    const uuidToTitle = new Map<string, string>();
    linkedBlocks.forEach((block) => {
      if (block) {
        uuidToTitle.set(block.uuid, block.title);
      }
    });

    // Обогащаем параметры displayValue
    return instancesWithParams.map((instance) => ({
      ...instance,
      params: instance.params.map((param) => {
        const displayedParam = displayedParameters.find((p) => p.uuid === param.blockParameterUuid);
        let displayValue: string;
        if (displayedParam?.dataType === "blockLink") {
          displayValue = uuidToTitle.get(param.linkedBlockInstanceUuid || "") || "—";
        } else if (param.value instanceof Number) {
          displayValue = `${param.value}`;
        } else {
          displayValue = param.value?.replace(/<[^>]*>/g, "") || "—";
        }
        return { ...param, displayValue };
      }),
    }));
  }, [instances, displayedParameters, groupingParam]);

  const addBlockInstance = async (data: IBlockInstance) => {
    await BlockInstanceRepository.create(bookDb, data);
    await BlockParameterInstanceRepository.appendDefaultParams(bookDb, data);
  };

  const saveGroup = async (group: IBlockInstanceGroup) => {
    await BlockInstanceGroupRepository.saveGroup(bookDb, group);
  };

  const moveGroupUp = async (uuid: string) => {
    await BlockInstanceGroupRepository.moveGroupUp(bookDb, blockUuid, uuid);
  };

  const moveGroupDown = async (uuid: string) => {
    await BlockInstanceGroupRepository.moveGroupDown(bookDb, blockUuid, uuid);
  };

  const deleteGroup = async (uuid: string) => {
    await BlockInstanceGroupRepository.deleteGroup(bookDb, uuid);
  };

  const deleteBlockInstance = async (data: IBlockInstance) => {
    await BlockInstanceRepository.remove(bookDb, data);
  };

  return {
    block,
    instances,
    addBlockInstance,
    groups,
    saveGroup,
    moveGroupUp,
    moveGroupDown,
    deleteGroup,
    deleteBlockInstance,
    instancesWithParams,
    displayedParameters,
    groupingParam,
    linkGroups,
  };
};
