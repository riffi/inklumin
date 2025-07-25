import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MarkerType } from "reactflow";
import { Loader } from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { IBlockInstance } from "@/entities/BookEntities";
import { IBlockParameterDataType } from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository"; // Added
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { BlockInstanceRelationRepository } from "@/repository/BlockInstance/BlockInstanceRelationRepository";
import { BlockInstanceRepository } from "@/repository/BlockInstance/BlockInstanceRepository";
import { BlockParameterInstanceRepository } from "@/repository/BlockInstance/BlockParameterInstanceRepository";
import { MindMap } from "../MindMap/MindMap";
import { FlowEdge, FlowNode } from "../MindMap/types";

interface InstanceMindMapProps {
  blockInstance: IBlockInstance;
}

export const InstanceMindMap = ({ blockInstance }: InstanceMindMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialNodes, setInitialNodes] = useState<FlowNode[]>([]);
  const [initialEdges, setInitialEdges] = useState<FlowEdge[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!blockInstance?.uuid) return;

        const currentUuid = blockInstance.uuid;
        const currentBlock = await BlockRepository.getByUuid(bookDb, blockInstance.blockUuid);
        const nodes: FlowNode[] = [];
        const edges: FlowEdge[] = [];

        // Добавляем текущий экземпляр как центральный узел
        nodes.push({
          id: currentUuid,
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            description: currentBlock?.title,
            label: blockInstance.title,
            icon: blockInstance.icon ?? currentBlock.icon,
            uuid: currentUuid,
            style: {
              background: "#4d97de",
              border: "1px solid #f0f0ff",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "10px",
              color: "#FFF",
            },
          },
        });

        const allRelations = await BlockInstanceRelationRepository.getInstanceRelations(
          bookDb,
          currentUuid
        );

        // Список параметров текущего блока, которые могут ссылаться на другие блоки
        const currentBlockReferencingParameters =
          await BlockParameterRepository.getReferencingParametersFromBlock(
            bookDb,
            blockInstance.blockUuid
          ); // Changed

        // Находим инстансы параметров, ссылающиеся на текущий инстанс блока
        const otherBlocksParamInstances =
          await BlockParameterInstanceRepository.getReferencingParamsToInstance(
            bookDb,
            currentUuid
          );

        // Находим инстансы параметров текущего инстанса блока, которые ссылаются на другие инстансы блоков
        const currentBlockParamInstances = (
          await BlockParameterInstanceRepository.getInstanceParams(bookDb, currentUuid)
        ).filter((param) =>
          currentBlockReferencingParameters.some(
            (refParam) => refParam.uuid === param.blockParameterUuid
          )
        );

        const otherBlockParamUuids = otherBlocksParamInstances.map(
          (param) => param.blockParameterUuid
        );

        const otherBlockReferencingParameters = await BlockParameterRepository.getByUuidList(
          bookDb,
          otherBlockParamUuids
        );

        // Объединяем все найденные связанные инстансы параметров в один массив
        const blockParameterInstances = [
          ...currentBlockParamInstances,
          ...otherBlocksParamInstances,
        ];

        // Добавляем заголовки для параметров инстансов
        const blockParameterInstancesWithTitles = blockParameterInstances.map((paramInstance) => {
          const param =
            currentBlockReferencingParameters.find(
              (p) => p.uuid === paramInstance.blockParameterUuid
            ) ||
            otherBlockReferencingParameters.find(
              (p) => p.uuid === paramInstance.blockParameterUuid
            );
          return {
            ...paramInstance,
            title: param?.title,
          };
        });

        // Собираем UUID всех связанных экземпляров
        const relatedInstanceUuids = new Set<string>();

        // Добавляем связи из отношений
        allRelations.forEach((rel) => {
          if (rel.sourceInstanceUuid === currentUuid) {
            relatedInstanceUuids.add(rel.targetInstanceUuid);
          } else {
            relatedInstanceUuids.add(rel.sourceInstanceUuid);
          }
        });

        const incomingInstanceUuids = new Set<string>();
        const outgoingInstanceUuids = new Set<string>();

        // Добавляем связи из параметров
        blockParameterInstances.forEach((param) => {
          if (param.blockInstanceUuid === currentUuid) {
            relatedInstanceUuids.add(param.linkedBlockInstanceUuid as string);
            outgoingInstanceUuids.add(param.linkedBlockInstanceUuid as string);
          } else if (param.linkedBlockInstanceUuid === currentUuid) {
            relatedInstanceUuids.add(param.blockInstanceUuid);
            incomingInstanceUuids.add(param.blockInstanceUuid);
          }
        });

        // Загружаем связанные экземпляры
        const relatedInstances = await BlockInstanceRepository.getByUuidList(bookDb, [
          ...relatedInstanceUuids,
        ]);

        // Загружаем связанные блоки
        const relatedBlocks = await BlockRepository.getByUuidList(bookDb, [
          ...relatedInstances.map((i) => i.blockUuid),
        ]);

        // Добавляем связанные экземпляры как узлы
        relatedInstances.forEach((instance) => {
          const relatedBlock = relatedBlocks.find((block) => block.uuid === instance.blockUuid);
          const isIncoming = incomingInstanceUuids.has(instance.uuid);

          nodes.push({
            id: instance.uuid!,
            type: "custom",
            position: { x: 0, y: 0 },
            gravity: instance.uuid === currentUuid ? "center" : isIncoming ? "left" : "right",
            data: {
              onClick: () => {
                navigate("/block-instance/card?uuid=" + instance.uuid);
              },
              label: instance.title,
              description: relatedBlock?.title,
              icon: instance.icon ?? relatedBlock?.icon,
              uuid: instance.uuid,
              style: {
                background: !isIncoming ? "#ff9900" : "#40c057",
                border: "1px solid #f0f0ff",
                borderRadius: "8px",
                padding: "5px 5px",
                fontSize: "10px",
                color: "#FFF",
              },
            },
          });
        });

        // Создаем ребра для связей из отношений
        allRelations.forEach((rel) => {
          const isSource = rel.sourceInstanceUuid === currentUuid;

          edges.push({
            id: `relation-${rel.uuid}`,
            source: isSource ? currentUuid : rel.sourceInstanceUuid,
            target: isSource ? rel.targetInstanceUuid : currentUuid,
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#4d97de",
              width: 15,
              height: 15,
            },
            style: {
              stroke: isSource ? "rgba(222,137,77,0.42)" : "rgba(148,193,233,0.42)",
              strokeWidth: 0.5,
            },
          });
        });

        // Создаем ребра для связей из параметров
        blockParameterInstancesWithTitles.forEach((param) => {
          const isOutgoing = param.blockInstanceUuid === currentUuid;

          edges.push({
            id: `param-${param.id}-${isOutgoing ? "out" : "in"}`,
            source: isOutgoing ? currentUuid : param.blockInstanceUuid,
            target: isOutgoing ? (param.linkedBlockInstanceUuid as string) : currentUuid,
            label: param.title,
            labelStyle: {
              fontSize: "5px",
              fill: "#797979",
              padding: "2px 2px",
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: isOutgoing ? "rgba(222,137,77,0.42)" : "rgba(148,193,233,0.42)",
              width: 15,
              height: 15,
            },
            style: {
              stroke: isOutgoing ? "rgba(222,137,77,0.42)" : "rgba(148,193,233,0.42)",
              strokeWidth: 0.5,
            },
          });
        });

        setInitialNodes(nodes);
        setInitialEdges(edges);
      } catch (error) {
        console.error("Ошибка загрузки данных инстансов:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [blockInstance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <MindMap
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      defaultLayout={"doubleCircular"}
      hideButtons={true}
    />
  );
};
