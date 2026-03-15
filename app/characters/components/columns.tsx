"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-actions";
import type { CharacterColumn } from "@/lib/Types";

export const columns: ColumnDef<CharacterColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => (
      <Badge variant="outline">Lv {row.original.level}</Badge>
    ),
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.health}</span>
    ),
  },
  {
    accessorKey: "attackDamage",
    header: "Attack",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.attackDamage}</span>
    ),
  },
  {
    accessorKey: "attackType",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant={row.original.attackType === "Ranged" ? "default" : "secondary"}
      >
        {row.original.attackType}
      </Badge>
    ),
  },
  {
    accessorKey: "weight",
    header: "Weight",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.weight}</span>
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
