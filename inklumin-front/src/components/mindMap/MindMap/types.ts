import type { CSSProperties } from "react";
import { EdgeMarkerType } from "@reactflow/core/dist/esm/types/edges";
import { IIcon } from "@/entities/ConstructorEntities";

export interface FlowNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    style?: React.CSSProperties;
    icon?: IIcon;
  };
  type?: string;
  gravity?: "center" | "left" | "right";
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  markerStart?: EdgeMarkerType;
  markerEnd?: EdgeMarkerType;
  style?: CSSProperties;
  data?: {
    label?: string;
    forwardEdge?: FlowEdge;
    backwardEdge?: FlowEdge;
  };
}
