"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clipboard, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { describeBotRun, type BotRunDetail } from "@/lib/anarchy-api";

const stateColor: Record<string, string> = {
  pending:       "bg-yellow-500",
  running:       "bg-green-500",
  stopping:      "bg-orange-500",
  "shutting-down": "bg-orange-500",
  stopped:       "bg-gray-500",
  terminated:    "bg-red-500",
};

interface Props {
  runId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RunDetailsModal: React.FC<Props> = ({ runId, isOpen, onClose }) => {
  const [detail, setDetail] = useState<BotRunDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const d = await describeBotRun(runId);
      setDetail(d);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && runId) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, runId]);

  return (
    <Modal
      title={`Run ${runId ?? ""}`}
      description="Live state of every EC2 instance in this run"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {detail ? `${detail.instances.length} instance(s)` : loading ? "loading…" : ""}
          </span>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className="mr-2 h-3 w-3" /> Refresh
          </Button>
        </div>
        {detail?.instances.length === 0 && (
          <p className="text-sm text-muted-foreground">No instances found.</p>
        )}
        {detail?.instances.map((i) => (
          <div
            key={i.id}
            className="rounded-md border p-3 flex items-center justify-between gap-2"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{i.id}</span>
                <Badge className={`${stateColor[i.state] ?? "bg-gray-500"} text-white`}>
                  {i.state}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {i.publicIp || "—"}
                {i.launched && (
                  <span className="ml-2">
                    launched {new Date(i.launched).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            {i.publicIp && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(i.publicIp!);
                  toast.success("IP copied");
                }}
              >
                <Clipboard className="h-3 w-3 text-blue-500" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};