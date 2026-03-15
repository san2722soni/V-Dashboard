"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
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
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <Badge className="bg-green-500">Completed</Badge>
        </div>
      );
    }
    if (build.buildFailed) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <Badge className="bg-red-500">Failed</Badge>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-yellow-600" />
        <Badge variant="outline">Pending</Badge>
      </div>
    );
  };

  const getBuildDuration = () => {
    if (build.completedAt) {
      const start = new Date(build.createdAt).getTime();
      const end = new Date(build.completedAt).getTime();
      const duration = Math.floor((end - start) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    }
    if (build.failedAt) {
      const start = new Date(build.createdAt).getTime();
      const end = new Date(build.failedAt).getTime();
      const duration = Math.floor((end - start) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    }
    return null;
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
              <div>
                <h4 className="text-muted-foreground font-medium">
                  Completed At
                </h4>
                <p className="text-sm mt-1">
                  {new Date(build.completedAt).toLocaleString()}
                </p>
              </div>
            )}

            {build.failedAt && (
              <div>
                <h4 className="text-muted-foreground font-medium">
                  Failed At
                </h4>
                <p className="text-sm mt-1">
                  {new Date(build.failedAt).toLocaleString()}
                </p>
              </div>
            )}

            {getBuildDuration() && (
              <div>
                <h4 className="text-muted-foreground font-medium">
                  Duration
                </h4>
                <p className="text-sm mt-1 font-mono">{getBuildDuration()}</p>
              </div>
            )}

            {build.buildFailed && build.errorMessage && (
              <div className="col-span-2">
                <h4 className="text-muted-foreground font-medium">
                  Error Message
                </h4>
                <div className="text-sm mt-1 bg-red-50 text-red-800 p-3 rounded-md border border-red-200">
                  <p className="whitespace-pre-wrap break-words">{build.errorMessage}</p>
                </div>
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
