// column.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clipboard, Eye, Trash, FileText, Download } from "lucide-react";
import { toast } from "sonner";

export type Build = {
  _id: string;
  version: string;
  message: string;
  platform?: string;
  releaseType?: string;
  buildFormat?: string | null;
  isActive: boolean;
  buildCompleted?: boolean;
  buildFailed?: boolean;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export const columns = (
  onViewDetails: (build: Build) => void,
  onDelete: (id: string) => void,
  onCheck: (id: string) => void,
  onViewLogs: (build: Build) => void,
  onDownload: (build: Build) => void,
  onCopyUrl: (build: Build) => void
): ColumnDef<Build>[] => [
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.version || "N/A"}</span>
    ),
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.original.platform;
      if (!platform) return <span className="text-muted-foreground">N/A</span>;
      return (
        <Badge
          variant="outline"
          className={
            platform === "android"
              ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
              : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
          }
        >
          {platform === "android" ? "Android" : "Windows"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "releaseType",
    header: "Type",
    cell: ({ row }) => {
      const { releaseType, buildFormat, platform } = row.original;
      if (!releaseType) return <span className="text-muted-foreground">N/A</span>;
      const label = releaseType === "development" ? "Dev" : "Release";
      const formatLabel = platform === "android" && buildFormat ? ` / ${buildFormat.toUpperCase()}` : "";
      return (
        <span className="text-sm">
          {label}{formatLabel}
        </span>
      );
    },
  },
  {
    accessorKey: "buildStatus",
    header: "Build Status",
    cell: ({ row }) => {
      if (row.original.buildCompleted) {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800">
            Completed
          </Badge>
        );
      }
      if (row.original.buildFailed) {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800">
            Failed
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800">
          Pending
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      return (
        <Badge
          variant="outline"
          className={
            row.original.isActive
              ? "bg-teal-700 border-teal-50 text-teal-200 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-100"
              : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.original.message}>
        {row.original.message}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
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
            onClick={() => onCopyUrl(row.original)}
            disabled={!row.original.buildCompleted}
            title={!row.original.buildCompleted ? "Build must be completed to copy URL" : "Copy build URL"}
          >
            <Clipboard className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className="transition-all duration-200 hover:scale-110 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900"
            onClick={() => onViewLogs(row.original)}
            title="View build logs"
          >
            <FileText className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className="transition-all duration-200 hover:scale-110 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900"
            onClick={() => onDownload(row.original)}
            disabled={!row.original.buildCompleted}
            title={!row.original.buildCompleted ? "Build must be completed to download" : "Download build"}
          >
            <Download className="h-4 w-4 text-purple-600" />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className="transition-all duration-200 hover:scale-110"
            onClick={() => onDelete(row.original?._id)}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            className={`transition-all duration-200 hover:scale-110 ${
              row.original.isActive
                ? "bg-green-50 border-green-500 text-green-600 hover:bg-green-100 dark:bg-green-950 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900"
                : ""
            }`}
            onClick={() => onCheck(row.original?._id)}
            disabled={!row.original.buildCompleted}
            title={!row.original.buildCompleted ? "Build must be completed to activate" : "Set as active"}
          >
            <Check className={`h-4 w-4 ${row.original.isActive ? "text-green-600 dark:text-green-400" : "text-gray-400"}`} />
          </Button>
        </div>
      );
    },
  },
];
