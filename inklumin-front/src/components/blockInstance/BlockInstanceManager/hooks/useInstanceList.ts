import { useMemo } from "react";
import { IBlockInstance, IBlockInstanceGroup } from "@/entities/BookEntities";
import { IBlock, IBlockParameter, IBlockParameterDataType } from "@/entities/ConstructorEntities";
import { BlockInstanceSortType } from "@/stores/uiSettingsStore/uiSettingsStore";
import { IBlockInstanceWithParams } from "./useBlockInstanceManager";

/**
 * Хук подготовки списка экземпляров к отображению
 */
export const useInstanceList = (
  instancesWithParams: IBlockInstanceWithParams[] | undefined,
  displayedParameters: IBlockParameter[] | undefined,
  groupingParam: IBlockParameter | undefined,
  currentGroupUuid: string,
  groups: IBlockInstanceGroup[] | undefined,
  linkGroups: IBlockInstance[] | undefined,
  block: IBlock | undefined,
  sortType: BlockInstanceSortType
) => {
  /**
   * Вычисляет уникальные значения параметров для фильтрации
   */
  const uniqueParamValuesMap = useMemo(() => {
    if (!instancesWithParams || !displayedParameters)
      return {} as Record<string, { value: string; label: string }[]>;

    const map: Record<string, { value: string; label: string }[]> = {};

    displayedParameters.forEach((param) => {
      const values = new Map<string, string>();
      instancesWithParams.forEach((instance) => {
        instance.params.forEach((p) => {
          if (p.blockParameterUuid === param.uuid) {
            if (param.dataType === "blockLink") {
              values.set(p.linkedBlockInstanceUuid || "", p.displayValue || "—");
            } else {
              const valueKey = p.displayValue;
              values.set(valueKey, valueKey);
            }
          }
        });
      });

      map[param.uuid!] = Array.from(values.entries()).map(([value, label]) => ({
        value,
        label,
      }));
    });

    return map;
  }, [instancesWithParams, displayedParameters]);

  /**
   * Фильтрует экземпляры по выбранным фильтрам
   */
  const filterInstances = (
    instances: IBlockInstanceWithParams[],
    filters: Record<string, string[]>
  ) => {
    return instances.filter((instance) => {
      return Object.entries(filters).every(([paramUuid, values]) => {
        if (values.length === 0) return true;
        const param = instance.params.find((p) => p.blockParameterUuid === paramUuid);
        if (!param) return false;
        const displayedParam = displayedParameters?.find((p) => p.uuid === paramUuid);
        const valueToCompare =
          displayedParam?.dataType === IBlockParameterDataType.blockLink
            ? param.linkedBlockInstanceUuid || ""
            : param.displayValue;
        return values.includes(valueToCompare);
      });
    });
  };

  /**
   * Сортирует экземпляры в соответствии с настройками пользователя
   */
  const sortInstances = (items: IBlockInstanceWithParams[]) => {
    const arr = [...items];
    arr.sort((a, b) => {
      if (sortType === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });
    return arr;
  };

  /**
   * Разбивает список по группам или параметру группировки
   */
  const getByGroup = (items: IBlockInstanceWithParams[], filters: Record<string, string[]>) => {
    const filtered = filterInstances(items, filters);
    const sorted = sortInstances(filtered);

    if (block?.useGroups === 1) {
      return sorted.filter((i) =>
        currentGroupUuid === "none"
          ? !i.blockInstanceGroupUuid ||
            groups?.findIndex((g) => g.uuid === i.blockInstanceGroupUuid) === -1
          : i.blockInstanceGroupUuid === currentGroupUuid
      );
    }
    if (groupingParam) {
      return sorted.filter((i) => {
        const param = i.params.find((p) => p.blockParameterUuid === groupingParam.uuid);
        if (currentGroupUuid === "none") {
          return true;
        }
        return param?.linkedBlockInstanceUuid === currentGroupUuid;
      });
    }
    return sorted;
  };

  /**
   * Отбирает группы, в которых есть экземпляры
   */
  const visibleLinkGroups = useMemo(() => {
    if (!linkGroups || !instancesWithParams || !groupingParam) return linkGroups;
    return linkGroups.filter((g) =>
      instancesWithParams.some((inst) =>
        inst.params.some(
          (p) => p.blockParameterUuid === groupingParam.uuid && p.linkedBlockInstanceUuid === g.uuid
        )
      )
    );
  }, [linkGroups, instancesWithParams, groupingParam]);

  return { uniqueParamValuesMap, getByGroup, visibleLinkGroups };
};
