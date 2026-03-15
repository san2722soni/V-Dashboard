"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2, Copy } from "lucide-react"
import { toast } from "sonner"

export type Developer = {
  _id: string
  email: string
  isAdmin: boolean
  profileComplete: boolean
  access: string[]
  profile: {
    name: string
    role: string
    gender: string
    permissions: string
  }
}

export const columns = (
  onViewDetails: (developer: Developer) => void,
  onEdit: (developer: Developer) => void,
  onDelete: (developerId: string) => void,
): ColumnDef<Developer>[] => [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "profile.name",
    header: "Name",
    cell: ({ row }) => row.original.profile?.name || "N/A",
  },
  {
    accessorKey: "profile.role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.profile?.role
      return role ? <Badge variant="outline">{role}</Badge> : "N/A"
    },
  },
  {
    accessorKey: "isAdmin",
    header: "Admin",
    cell: ({ row }) => (
      <Badge variant={row.original.isAdmin ? "default" : "secondary"}>
        {row.original.isAdmin ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.profile?.permissions?.split(",").map((permission) => (
          <Badge key={permission} variant="outline" className="text-xs">  
            {permission.trim()}
          </Badge>
        )) || "N/A"}
      </div>
    )
  },
  {
    accessorKey: "access",
    header: "Access Levels",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.access?.map((access) => (
          <Badge key={access} variant="outline" className="text-xs">
            {access}
          </Badge>
        )) || "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(row.original)} title="View details">
          <Eye className="h-4 w-4 text-primary" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)} title="Edit developer">
          <Pencil className="h-4 w-4 text-amber-500" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(row.original._id)} title="Delete developer">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(row.original._id)
            toast.success("Developer ID copied")
          }}
          title="Copy developer ID"
        >
          <Copy className="h-4 w-4 text-blue-500" />
        </Button>
      </div>
    ),
  },
]