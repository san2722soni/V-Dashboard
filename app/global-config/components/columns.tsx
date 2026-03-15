"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-actions";
import type { GlobalConfigColumn } from "@/lib/Types";

export const columns: ColumnDef<GlobalConfigColumn>[] = [
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <span className="font-mono">{String(row.original.value)}</span>
    ),
  },
  {
    accessorKey: "valueType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.valueType}</Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
