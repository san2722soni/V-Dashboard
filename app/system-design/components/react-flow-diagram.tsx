"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// @ts-ignore
function CustomNode({ data }) {
  return (
    <div
      onClick={data.onClick}
      className={`
        px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 bg-white
        hover:shadow-lg hover:scale-105 max-w-40 text-center 
      `}
      style={{
        outline: "1px solid #d1d5db",
        outlineOffset: "-1px",
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-bold text-gray-900">
        {data.emoji} {data.title}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function ReactFlowDiagram({
  // @ts-ignore
  nodes: dataNodes,
  // @ts-ignore
  edges: dataEdges,
  // @ts-ignore
  onNodeClick,
  // @ts-ignore
  shouldMove: panOnMove,
}) {
  const calculatePositions = useCallback(() => {
    const positions = {
      A: { x: 0, y: 100 },
      B: { x: 280, y: 100 },
      C: { x: 560, y: 100 },
      D: { x: 840, y: 100 },
      E: { x: 1120, y: 100 },
      F: { x: 560, y: 300 },
      G: { x: 840, y: 300 },
      H: { x: 1120, y: 300 },
      I: { x: 140, y: -150 },
      J: { x: 980, y: -150 },
      K: { x: 1260, y: -150 },
    };
    return positions;
  }, []);

  const positions = useMemo(() => calculatePositions(), [calculatePositions]);

  const rfNodes = useMemo(
    () =>
      // @ts-ignore
      dataNodes.map((node) => ({
        id: node.id,
        data: {
          label: node.title,
          title: node.title,
          subtitle: node.subtitle,
          description: node.description,
          detailedDescription: node.detailedDescription,
          functions: node.functions,
          category: node.category,
          type: node.type,
          emoji: node.emoji,
          onClick: () => onNodeClick(node),
        },
        // @ts-ignore
        position: positions[node.id] || { x: 0, y: 0 },
      })),
    [dataNodes, positions, onNodeClick]
  );

  const rfEdges = useMemo(
    () =>
      // @ts-ignore

      dataEdges.map((edge) => {
        const isDotted = edge.dotted;
        return {
          id: `e${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          animated: true,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDotted ? "#999" : "#4B5563",
          },
          style: {
            stroke: isDotted ? "#999" : "#4B5563",
            strokeWidth: isDotted ? 1.5 : 2.5,
            strokeDasharray: isDotted ? "5,5" : "0",
            strokeLinecap: "round",
          },
        };
      }),
    [dataEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{
          default: CustomNode,
        }}
        defaultViewport={{ x: 150, y: 250, zoom: 1.0 }}
        fitView={false}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        minZoom={0.5}
        maxZoom={2}
        nodesDraggable={false}
      >
        <Background
          color="#d1d5db"
          gap={20}
          size={2}
          variant={BackgroundVariant.Dots}
        />
        <Controls position="top-right" />
      </ReactFlow>
    </div>
  );
}
