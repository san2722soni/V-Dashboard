"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Copy, Pencil, Trash } from "lucide-react"

export type ExcalidrawBoard = {
  _id: string
  title: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export const columns = (
  onEdit: (id: string) => void,
  onClone: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<ExcalidrawBoard>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span
        className="font-medium cursor-pointer hover:underline"
        onClick={() => onEdit(row.original._id)}
      >
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.createdBy}
      </span>
    ),
  },
  {
    accessorKey: "updatedBy",
    header: "Last Updated By",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.updatedBy}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex flex-row items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="transition-all duration-200 hover:scale-110"
          onClick={() => onEdit(row.original._id)}
          title="Edit board"
        >
          <Pencil className="h-4 w-4 text-amber-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="transition-all duration-200 hover:scale-110"
          onClick={() => onClone(row.original._id)}
          title="Clone board"
        >
          <Copy className="h-4 w-4 text-blue-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="transition-all duration-200 hover:scale-110"
          onClick={() => onDelete(row.original._id)}
          title="Delete board"
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
]
