"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import type { Query } from "@/lib/Types";

interface ViewQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: Query | null;
}

const statusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-600";
    case "rejected":
      return "bg-red-600";
    default:
      return "bg-yellow-500 text-black";
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const ViewQueryModal = ({ isOpen, onClose, query }: ViewQueryModalProps) => {
  if (!query) return null;

  let formattedQuery = query.queryString;
  try {
    formattedQuery = JSON.stringify(JSON.parse(query.queryString), null, 2);
  } catch {}

  let formattedResult = null;
  if (query.result !== null && query.result !== undefined) {
    try {
      formattedResult =
        typeof query.result === "string"
          ? query.result
          : JSON.stringify(query.result, null, 2);
    } catch {
      formattedResult = String(query.result);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Query Details
            <Badge variant="outline">
              {query.type === "mongo" ? "MongoDB" : "Redis"}
            </Badge>
            <Badge className={statusColor(query.status)}>
              {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Creator</Label>
              <p className="text-sm text-muted-foreground">{query.creator.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Created At</Label>
              <p className="text-sm text-muted-foreground">{formatDate(query.createdAt)}</p>
            </div>
          </div>

          {query.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground">{query.description}</p>
            </div>
          )}

          <Separator />

          <div>
            <Label className="text-sm font-medium">Query</Label>
            <pre className="mt-1 p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto">
              {formattedQuery}
            </pre>
          </div>

          {query.approvedBy && (
            <div>
              <Label className="text-sm font-medium">Approved By</Label>
              <p className="text-sm text-muted-foreground">{query.approvedBy.email}</p>
            </div>
          )}

          {query.executedAt && (
            <div>
              <Label className="text-sm font-medium">Last Executed</Label>
              <p className="text-sm text-muted-foreground">{formatDate(query.executedAt)}</p>
            </div>
          )}

          {formattedResult && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium">Last Result</Label>
                <pre className="mt-1 p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto max-h-[300px] overflow-y-auto">
                  {formattedResult}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
