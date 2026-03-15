"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import type { Build } from "./column";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Build | null;
}

export const BuildModal = ({ isOpen, onClose, build }: BuildModalProps) => {
  if (!build) return null;

  const getBuildStatusBadge = () => {
    if (build.buildCompleted) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    if (build.buildFailed) {
      return <Badge className="bg-red-500">Failed</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Build Details
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-3" />

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-muted-foreground font-medium">Version</h4>
              <p className="text-base font-semibold mt-1">{build.version}</p>
            </div>

            <div>
              <h4 className="text-muted-foreground font-medium">
                Active Status
              </h4>
              <p className="text-base font-semibold mt-1">
                {build?.isActive ? (
                  <Badge className="bg-teal-600">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </p>
            </div>

            <div>
              <h4 className="text-muted-foreground font-medium">
                Build Status
              </h4>
              <div className="mt-1">{getBuildStatusBadge()}</div>
            </div>

            <div>
              <h4 className="text-muted-foreground font-medium">Created At</h4>
              <p className="text-sm mt-1">
                {new Date(build.createdAt).toLocaleString()}
              </p>
            </div>

            {build.completedAt && (
              <div className="col-span-2">
                <h4 className="text-muted-foreground font-medium">
                  Completed At
                </h4>
                <p className="text-sm mt-1">
                  {new Date(build.completedAt).toLocaleString()}
                </p>
              </div>
            )}

            {build.buildFailed && build.errorMessage && (
              <div className="col-span-2">
                <h4 className="text-muted-foreground font-medium">
                  Error Message
                </h4>
                <p className="text-sm mt-1 bg-red-50 text-red-800 p-3 rounded-md">
                  {build.errorMessage}
                </p>
              </div>
            )}

            <div className="col-span-2">
              <h4 className="text-muted-foreground font-medium">Message</h4>
              <p className="text-base mt-1 bg-muted p-3 rounded-md whitespace-pre-wrap">
                {build?.message || "No message"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// New LogsModal Component
interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Build | null;
}

export const LogsModal = ({ isOpen, onClose, build }: LogsModalProps) => {
  const [logs, setLogs] = useState<string>("");
  const [filteredLogs, setFilteredLogs] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && build) {
      fetchLogs();
    } else {
      setError(null);
      setLogs("");
      setFilteredLogs("");
      setSearch("");
    }
  }, [isOpen, build]);

  const fetchLogs = async () => {
    if (!build) return;

    try {
      setLoading(true);
      setError(null);
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/clientBuild/getLogs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buildId: build._id }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const logText = result.data?.logs || "No logs available yet";
        setLogs(logText);
        setFilteredLogs(logText);
        toast.success("Logs loaded successfully");
      } else {
        const errorData = await response.json();
        const errorMsg = errorData?.message || "Failed to fetch logs";
        setError(errorMsg);
        setLogs("");
        setFilteredLogs("");
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Failed to fetch logs", error);
      const errorMsg = error.message || "Error fetching logs";
      setError(errorMsg);
      setLogs("");
      setFilteredLogs("");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs
      .split("\n")
      .filter((line) => line.toLowerCase().includes(value.toLowerCase()))
      .join("\n");

    setFilteredLogs(filtered || "No matching results...");
  };

  const handleCopy = () => {
    if (logs) {
      navigator.clipboard.writeText(logs);
      toast.success("Logs copied to clipboard");
    }
  };

  const handleDownload = () => {
    if (!logs) {
      toast.error("No logs to download");
      return;
    }
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `build-${build?.version}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs downloaded successfully");
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  if (!build) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] !grid-rows-none !flex !flex-col overflow-hidden bg-gray-950 text-gray-100 border-gray-800 p-0">
        <DialogHeader className="border-b border-gray-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-100">
                Build Logs - {build.version}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-1">
                Build ID: {build._id}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="border border-gray-600 rounded-md px-3 py-1 text-sm bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100"
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={loading || !logs}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={loading || !logs}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-950 border border-red-800 rounded-lg p-4 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-400 font-semibold mb-2">Error Loading Logs</p>
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="bg-red-900 border-red-700 hover:bg-red-800 text-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-words">
              {filteredLogs || "No logs available"}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};