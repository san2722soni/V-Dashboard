"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2, Check, Play } from "lucide-react"
import type { Query, User } from "@/lib/Types"

const statusVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "default"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-600 hover:bg-green-700"
    case "rejected":
      return "bg-red-600 hover:bg-red-700"
    default:
      return "bg-yellow-500 hover:bg-yellow-600 text-black"
  }
}

export const columns = (
  currentUser: User | null,
  onView: (query: Query) => void,
  onEdit: (query: Query) => void,
  onDelete: (queryId: string) => void,
  onApprove: (query: Query) => void,
  onExecute: (query: Query) => void,
): ColumnDef<Query>[] => [
  {
    accessorKey: "creator.email",
    header: "Creator",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.creator.email}</span>
    ),
  },
  {
    accessorKey: "queryString",
    header: "Query",
    cell: ({ row }) => {
      const q = row.original.queryString
      const truncated = q.length > 50 ? q.substring(0, 50) + "..." : q
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {truncated}
        </span>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={statusColor(row.original.status)}>
        {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const query = row.original
      const isCreator = currentUser?.id === query.creator.developerId
      const isAdmin = currentUser?.role === "admin"
      const canModify = isCreator || isAdmin
      const isPending = query.status === "pending"
      const isApproved = query.status === "approved"

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(query)}
            title="View query"
          >
            <Eye className="h-4 w-4 text-primary" />
          </Button>

          {canModify && isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(query)}
              title="Edit query"
            >
              <Pencil className="h-4 w-4 text-amber-500" />
            </Button>
          )}

          {canModify && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(query._id)}
              title="Delete query"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}

          {isAdmin && isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApprove(query)}
              title="Approve query"
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
          )}

          {isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExecute(query)}
              title="Execute query"
            >
              <Play className="h-4 w-4 text-blue-500" />
            </Button>
          )}
        </div>
      )
    },
  },
]
