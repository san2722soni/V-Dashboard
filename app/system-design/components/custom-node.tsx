"use client"
import { Handle, Position } from "@xyflow/react";

interface CustomNodeProps {
  data: {
    label: string
    category: string
    description: string
    onClick: () => void
  }
}

/**
 * Custom node component for React Flow
 * Handles visual representation and click interactions
 */
export default function CustomNode({ data }: CustomNodeProps) {
  return (
    <div onClick={data.onClick} className="hover:shadow-lg transition-shadow">
      <Handle type="target" position={Position.Top} />
      <div className="px-3 py-2">
        <div className="font-semibold text-xs">{data.label}</div>
        <div className="text-xs opacity-75">{data.category}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
