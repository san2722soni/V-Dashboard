"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-actions";
import type { BuildingColumn } from "@/lib/Types";

export const columns: ColumnDef<BuildingColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => (
      <span>{row.original.health}</span>
    ),
  },
  {
    accessorKey: "attack",
    header: "Attack",
    cell: ({ row }) => (
      <span>{row.original.attack ?? "-"}</span>
    ),
  },
  {
    accessorKey: "storage",
    header: "Storage",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.storage}</Badge>
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => (
      <Badge variant="outline">Level {row.original.level ?? 0}</Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
