import { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  Edge,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import { Button, Group } from "@mantine/core";
import { circularLayout, doubleCircularLayout, gridLayout, hierarchicalLayout } from "./layouts";
import { BidirectionalEdge } from "./parts/BidirectionalEdge";
import { CustomNode } from "./parts/CustomNode";
import { FlowEdge, FlowNode } from "./types";
import { updateEdgeHandles } from "./utils/layoutUtils";

import "reactflow/dist/style.css";
import "./react-flow-override.css";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { bidirectional: BidirectionalEdge };

interface MindMapProps {
  initialNodes: FlowNode[];
  initialEdges: FlowEdge[];
  defaultLayout?: "hierarchical" | "circular" | "grid" | "doubleCircular";
  hideButtons?: boolean;
}

export const MindMap = ({
  initialNodes,
  initialEdges,
  defaultLayout,
  hideButtons,
}: MindMapProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [originalNodes, setOriginalNodes] = useState<FlowNode[]>(initialNodes);
  const [originalEdges, setOriginalEdges] = useState<FlowEdge[]>(initialEdges);
  const [selectedLayout, setSelectedLayout] = useState<
    "hierarchical" | "circular" | "grid" | "doubleCircular"
  >(defaultLayout ?? "hierarchical");
  const { fitView } = useReactFlow();

  useEffect(() => {
    setOriginalNodes(initialNodes);
    setOriginalEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const applyLayout = useCallback(
    (layoutType: "hierarchical" | "circular" | "grid" | "doubleCircular") => {
      let layoutNodes = [...originalNodes];
      setSelectedLayout(layoutType);

      switch (layoutType) {
        case "hierarchical":
          layoutNodes = hierarchicalLayout(originalNodes, originalEdges);
          break;
        case "circular":
          layoutNodes = circularLayout(originalNodes);
          break;
        case "doubleCircular":
          layoutNodes = doubleCircularLayout(originalNodes);
          break;
        case "grid":
          layoutNodes = gridLayout(originalNodes);
          break;
      }

      setNodes(layoutNodes);
      setEdges(updateEdgeHandles(originalEdges, layoutNodes));
    },
    [originalNodes, originalEdges, setNodes, setEdges]
  );

  useEffect(() => {
    if (originalNodes.length > 0) {
      applyLayout(selectedLayout);
    }
  }, [originalNodes, originalEdges, selectedLayout, applyLayout]);

  useEffect(() => {
    fitView({ padding: 0.1, duration: 500 });
  }, [nodes, fitView]);

  useEffect(() => {
    const handleResize = () => fitView({ padding: 0.1, duration: 500 });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitView]);

  return (
    <div style={{ height: "800px" }}>
      {!hideButtons && (
        <Group spacing="xs">
          {["hierarchical", "circular", "doubleCircular", "grid"].map((layout) => (
            <Button
              key={layout}
              size="xs"
              variant={selectedLayout === layout ? "light" : "outline"}
              onClick={() => applyLayout(layout)}
            >
              {
                {
                  hierarchical: "Иерархическая",
                  circular: "Круговая",
                  doubleCircular: "Двойной круг",
                  grid: "Сетка",
                }[layout]
              }
            </Button>
          ))}
        </Group>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        maxZoom={3}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
