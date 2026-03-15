"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-actions";
import type { InventoryColumn } from "@/lib/Types";

export const columns: ColumnDef<InventoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "attack",
    header: "Attack",
    cell: ({ row }) => (
      <span>{row.original.attack ?? "-"}</span>
    ),
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => (
      <span>{row.original.health ?? "-"}</span>
    ),
  },
  {
    accessorKey: "range",
    header: "Range",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.range ?? "-"}</Badge>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.duration ?? "-"}</Badge>
    ),
  },
  {
    accessorKey: "round",
    header: "Ammo",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.round ?? "-"}</Badge>
    ),
  },
  {
    accessorKey: "storageCost",
    header: "Storage Cost",
    cell: ({ row }) => (
      <span>{row.original.storageCost ?? "-"}</span>
    ),
  },
  {
    accessorKey: "purchaseCost",
    header: "Purchase Cost",
    cell: ({ row }) => (
      <span>{row.original.purchaseCost ?? "-"}</span>
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
