"use client";

import { useCallback, useMemo, useState } from "react";
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

function CustomNode({ data }: any) {
  return (
    <div
      onClick={data.onClick}
      className={`
        px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 bg-white
        hover:shadow-lg hover:scale-105 min-w-48 text-center 
      `}
      style={{
        outline: "1px solid #d1d5db",
        outlineOffset: "-1px",
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="text-sm font-bold text-gray-900 mb-1">
        {data.emoji} {data.title}
      </div>
      {data.subtitle && (
        <div className="text-xs text-gray-600">({data.subtitle})</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default function VCMWorkflow() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const workflowNodes = useMemo(() => [
    {
      id: "A",
      title: "Update",
      subtitle: "override",
      emoji: "🔄",
      description: "Override and update your local workspace",
    },
    {
      id: "B",
      title: "Local",
      subtitle: "changes",
      emoji: "💻",
      description: "Make changes in your local environment",
    },
    {
      id: "C",
      title: "Pull from parent",
      subtitle: "parent changes",
      emoji: "⬇️",
      description: "Fetch and integrate changes from parent branch",
    },
    {
      id: "D",
      title: "Conflict",
      subtitle: "if comes",
      emoji: "⚠️",
      description: "Handle merge conflicts if they arise",
    },
    {
      id: "E",
      title: "Resolve",
      subtitle: "",
      emoji: "✅",
      description: "Resolve any conflicts found",
    },
    {
      id: "F",
      title: "Verify",
      subtitle: "parentChangeSet === Remote branch Id changeSet",
      emoji: "🔍",
      description: "Ensure parent changeset matches remote branch",
    },
    {
      id: "G",
      title: "Push",
      subtitle: "changes",
      emoji: "⬆️",
      description: "Push your changes to remote",
    },
    {
      id: "H",
      title: "Stable",
      subtitle: "",
      emoji: "🎯",
      description: "Changes are now stable",
    },
    {
      id: "I",
      title: "Copy to parent",
      subtitle: "changes",
      emoji: "📤",
      description: "Propagate changes to parent branch",
    },
  ], []);

  const workflowEdges = useMemo(() => [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "D" },
    { source: "D", target: "E" },
    { source: "E", target: "F" },
    { source: "F", target: "G" },
    { source: "G", target: "H" },
    { source: "H", target: "I" },
    { source: "I", target: "A", dotted: true }, // Cycle repeat
  ], []);

  const calculatePositions = useCallback(() => {
    const positions = {
      A: { x: 0, y: 100 },
      B: { x: 280, y: 100 },
      C: { x: 560, y: 100 },
      D: { x: 840, y: 100 },
      E: { x: 1120, y: 100 },
      F: { x: 280, y: 300 },
      G: { x: 560, y: 300 },
      H: { x: 840, y: 300 },
      I: { x: 1120, y: 300 },
    };
    return positions;
  }, []);

  const positions = useMemo(() => calculatePositions(), [calculatePositions]);
// @ts-ignore
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const rfNodes = useMemo(
    () =>
      workflowNodes.map((node) => ({
        id: node.id,
        data: {
          label: node.title,
          title: node.title,
          subtitle: node.subtitle,
          description: node.description,
          emoji: node.emoji,
          onClick: () => handleNodeClick(node),
        },
        //@ts-ignore
        position: positions[node.id] || { x: 0, y: 0 },
      })),
      [workflowNodes, positions, handleNodeClick]
    );
    
    const rfEdges = useMemo(
      () =>
        workflowEdges.map((edge) => {
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
      [workflowEdges]
    );
    
    const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
    //@ts-ignore
    const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">VCM Workflow</h1>
        <p className="text-sm text-gray-600 mt-1">
          Version Control Management workflow visualization
        </p>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 rounded-lg overflow-hidden bg-white m-4">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={{
              default: CustomNode,
            }}
            defaultViewport={{ x: 50, y: 150, zoom: 0.8 }}
            fitView={false}
            panOnDrag={true}
            panOnScroll={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            minZoom={0.3}
            maxZoom={1.5}
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

        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Details</h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-3xl mb-2">{selectedNode.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedNode.title}
                </h3>
                {selectedNode.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    ({selectedNode.subtitle})
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  {selectedNode.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}