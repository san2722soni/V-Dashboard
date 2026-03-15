"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clipboard, Eye, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/lib/auth"

export type FeatureFlag = {
  id: string
  name: string
  type: string
  value: string
  createdAt: string
  updatedAt: string
}

export const columns = (
  onViewDetails: (FeatureFlag: FeatureFlag) => void,
  onEdit: (FeatureFlag: FeatureFlag) => void,
  onDelete: (name: string) => void,
): ColumnDef<FeatureFlag>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name || "N/A",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type
      return type ? <Badge variant="outline">{type}</Badge> : "N/A"
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => <Button variant={"outline"}>{row.original.value}</Button>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = authService.getCurrentUser()
      const isAdmin = user?.role === "admin"

      return (
        <div className="flex flex-row items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:scale-110 bg-transparent"
            onClick={() => onViewDetails(row.original)}
          >
            <Eye className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className="transition-all duration-200 hover:scale-110"
            onClick={() => {
              navigator.clipboard.writeText(row.original?.name)
              toast.success("FeatureFlag name copied to clipboard")
            }}
          >
            <Clipboard className="h-4 w-4 text-blue-500" />
          </Button>

          {isAdmin && (
            <Button
              variant={"outline"}
              size={"icon"}
              className="transition-all duration-200 hover:scale-110"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="h-4 w-4 text-amber-500" />
            </Button>
          )}

          {isAdmin && (
            <Button
              variant={"outline"}
              size={"icon"}
              className="transition-all duration-200 hover:scale-110"
              onClick={() => onDelete(row.original.name)}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      )
    },
  },
]
