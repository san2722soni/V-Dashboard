"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export type WhitelistedUser = {
  _id: string
  email: string
  createdAt: string
  updatedAt: string
}

export const columns = (
  onDelete: (id: string) => void,
): ColumnDef<WhitelistedUser>[] => [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Added At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(row.original._id)}
        title="Remove from whitelist"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    ),
  },
]
