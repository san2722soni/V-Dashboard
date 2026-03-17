"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Server, Play, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";
import type { Query } from "@/lib/Types";

interface ExecuteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  query: Query | null;
}

export const ExecuteSheet = ({ isOpen, onClose, query }: ExecuteSheetProps) => {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<string[]>([]);

  const isMongo = query?.type === "mongo";

  // Extract the command string and count placeholders
  const { displayCommand, placeholderCount } = useMemo(() => {
    if (!query) return { displayCommand: "", placeholderCount: 0 };
    let cmd = query.queryString;
    try {
      const parsed = JSON.parse(query.queryString);
      cmd = parsed.command ?? JSON.stringify(parsed, null, 2);
    } catch {}
    const count = (cmd.match(/<<\$>>/g) || []).length;
    return { displayCommand: cmd, placeholderCount: count };
  }, [query]);

  const handleExecute = async () => {
    if (!query) return;

    // Validate params if needed
    if (placeholderCount > 0) {
      const missing = paramValues.slice(0, placeholderCount).some((v) => !v?.trim());
      if (missing || paramValues.length < placeholderCount) {
        toast.error("Fill in all parameter values before executing");
        return;
      }
    }

    setExecuting(true);
    setResult(null);
    setError(null);

    try {
      const body: Record<string, unknown> = { id: query._id };
      if (placeholderCount > 0) {
        body.params = paramValues.slice(0, placeholderCount).map((v) => v.trim());
      }

      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/query/executeQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (data.success) {
        const formatted =
          typeof data.data === "string"
            ? data.data
            : JSON.stringify(data.data, null, 2);
        setResult(formatted);
        toast.success("Query executed successfully");
      } else {
        setError(data.message || "Execution failed");
        toast.error(data.message || "Execution failed");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Result copied to clipboard");
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setParamValues([]);
    onClose();
  };

  const setParam = (index: number, value: string) => {
    setParamValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  if (!query) return null;

  const accentColor = isMongo ? "text-green-400" : "text-cyan-400";
  const accentBg = isMongo ? "bg-green-600 hover:bg-green-700" : "bg-cyan-600 hover:bg-cyan-700";

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl w-full p-0 bg-[#1a1a2e] border-l border-gray-700 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <SheetTitle
            className="flex items-center gap-2 text-white"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {isMongo ? (
              <Database className="h-5 w-5 text-green-400" />
            ) : (
              <Server className="h-5 w-5 text-cyan-400" />
            )}
            Execute Query
            <Badge
              variant="outline"
              className={`ml-2 ${isMongo ? "border-green-600 text-green-400" : "border-cyan-600 text-cyan-400"}`}
            >
              {isMongo ? "MongoDB" : "Redis"}
            </Badge>
          </SheetTitle>
          <SheetDescription className="text-gray-400" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {query.description || (isMongo ? "MongoDB Query" : "Redis Command")}
          </SheetDescription>
        </SheetHeader>

        {/* Query Preview */}
        <div className="px-5 py-3 border-b border-gray-700 bg-[#0d1117] flex-shrink-0">
          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Query
          </span>
          <pre
            className={`${accentColor} text-sm whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto`}
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {displayCommand}
          </pre>
        </div>

        {/* Parameter Inputs — shown only when <<$>> placeholders exist */}
        {placeholderCount > 0 && (
          <div className="px-5 py-3 border-b border-gray-700 bg-[#111827] flex-shrink-0 space-y-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider block" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Parameters ({placeholderCount})
            </span>
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="text-xs text-gray-400 w-24 flex-shrink-0"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  Param {i + 1}
                </span>
                <Input
                  className="bg-[#1a1a2e] border-gray-600 text-white font-mono text-sm focus:border-gray-400"
                  placeholder={`value ${i + 1}`}
                  value={paramValues[i] ?? ""}
                  onChange={(e) => setParam(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && i === placeholderCount - 1) handleExecute();
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-3 flex-shrink-0">
          <Button
            onClick={handleExecute}
            disabled={executing}
            className={`${accentBg} text-white`}
          >
            <Play className="h-4 w-4 mr-2" />
            {executing ? "Executing..." : "Execute"}
          </Button>
          {result && (
            <Button
              variant="outline"
              onClick={handleCopyResult}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Result
            </Button>
          )}
        </div>

        {/* Results Area */}
        <div
          className="flex-1 overflow-y-auto bg-[#0d1117] p-5"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {executing && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-6 w-6 border-b-2 border-gray-400 rounded-full" />
                <span className="text-gray-500 text-sm">Executing query...</span>
              </div>
            </div>
          )}

          {error && !executing && (
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <pre className="text-sm whitespace-pre-wrap break-words">{error}</pre>
            </div>
          )}

          {result && !executing && (
            <pre className="text-gray-300 text-sm whitespace-pre-wrap break-words">
              {result}
            </pre>
          )}

          {!result && !error && !executing && (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-600 text-sm">
                Click Execute to run the query
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
