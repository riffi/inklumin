import { useEffect, useState } from "react";
import { MarkerType } from "reactflow";
import { Loader } from "@mantine/core";
import { bookDb } from "@/entities/bookDb";
import { IBlockStructureKind } from "@/entities/ConstructorEntities";
import { BlockParameterRepository } from "@/repository/Block/BlockParameterRepository";
import { BlockRelationRepository } from "@/repository/Block/BlockRelationRepository";
import { BlockRepository } from "@/repository/Block/BlockRepository";
import { getBlockTitle } from "@/utils/configUtils";
import { MindMap } from "../MindMap/MindMap";
import { FlowEdge, FlowNode } from "../MindMap/types";

export const BlocksMindMap = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialNodes, setInitialNodes] = useState<FlowNode[]>([]);
  const [initialEdges, setInitialEdges] = useState<FlowEdge[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const blocks = await BlockRepository.getAll(bookDb);
        const relations = await BlockRelationRepository.getAllRelations(bookDb);
        const parameters = await BlockParameterRepository.getAllParameters(bookDb);

        const parameterRelations = parameters
          .filter((p) => p.linkedBlockUuid)
          .map((p) => ({
            id: `param-${p.uuid}`,
            source: p.blockUuid,
            target: p.linkedBlockUuid!,
            labelStyle: {
              fontSize: "5px",
              fill: "#797979",
              padding: "2px 2px",
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#4d97de",
              width: 15,
              height: 15,
            },
            style: {
              stroke: "rgba(77,151,222,0.42)",
              strokeWidth: 0.5,
            },
          }));

        const edges = [
          ...relations.map((r) => ({
            id: r.uuid,
            source: r.sourceBlockUuid,
            target: r.targetBlockUuid,
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#4d97de",
              width: 15,
              height: 15,
            },
            style: {
              stroke: "rgba(77,151,222,0.42)",
              strokeWidth: 0.5,
            },
          })),
          ...parameterRelations,
        ];

        const nodes = blocks.map((block) => ({
          id: block.uuid,
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            label: getBlockTitle(block),
            icon: block.icon,
            uuid: block.uuid,
            style: {
              background: "#4d97de",
              border: "1px solid #f0f0ff",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "10px",
              color: "#FFF",
            },
          },
        }));

        setInitialNodes(nodes);
        setInitialEdges(edges);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="xl" />
      </div>
    );
  }

  return <MindMap initialNodes={initialNodes} initialEdges={initialEdges} />;
};
