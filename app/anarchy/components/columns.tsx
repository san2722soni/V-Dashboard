"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Trash, Eye } from "lucide-react";
import { toast } from "sonner";
import type { BotRun } from "@/lib/anarchy-api";

const fmtRel = (iso?: string) => {
  if (!iso) return "—";
  const ms = new Date(iso).getTime() - Date.now();
  const min = Math.round(ms / 60000);
  if (min <= 0) return "expired";
  if (min < 60) return `${min}m`;
  return `${Math.round(min / 60)}h`;
};

export const columns = (
  onTerminate: (runId: string) => void,
  onDetails:   (runId: string) => void,
): ColumnDef<BotRun>[] => [
  {
    accessorKey: "runId",
    header: "Run ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.runId}</span>
    ),
  },
  {
    accessorKey: "count",
    header: "Bots",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.instanceIds?.length ?? 0}</Badge>
    ),
  },
  {
    accessorKey: "instanceIds",
    header: "Instance IDs",
    cell: ({ row }) => (
      <div className="font-mono text-xs space-y-0.5">
        {(row.original.instanceIds ?? []).slice(0, 3).map((id) => (
          <div key={id}>{id}</div>
        ))}
        {(row.original.instanceIds ?? []).length > 3 && (
          <div className="text-muted-foreground">
            +{row.original.instanceIds.length - 3} more
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires in",
    cell: ({ row }) => {
      const t = fmtRel(row.original.expiresAt);
      return <span className="text-sm text-muted-foreground">{t}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDetails(row.original.runId)}
          title="View per-instance state"
        >
          <Eye className="h-4 w-4 text-primary" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(row.original.runId);
            toast.success("Run ID copied");
          }}
        >
          <Clipboard className="h-4 w-4 text-blue-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (confirm(`Terminate run ${row.original.runId}?`)) {
              onTerminate(row.original.runId);
            }
          }}
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];