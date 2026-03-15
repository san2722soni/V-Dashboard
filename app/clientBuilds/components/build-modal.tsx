"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
        <Badge className="bg-green-500 hover:bg-green-600">
          ✓ Completed
        </Badge>
      );
    }
    if (build.buildFailed) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          ✗ Failed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
        ⏳ Pending
      </Badge>
    );
  };

  const getBuildDuration = () => {
    if (!build.completedAt && !build.failedAt) return null;
    
    const endTime = build.completedAt || build.failedAt;
    if (!endTime) return null;
    
    const duration = new Date(endTime).getTime() - new Date(build.createdAt).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Build Details - {build.version}
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
              <h4 className="text-muted-foreground font-medium">Platform</h4>
              <p className="text-base font-semibold mt-1 capitalize">
                {build.platform || "N/A"}
              </p>
            </div>

            <div>
              <h4 className="text-muted-foreground font-medium">Release Type</h4>
              <p className="text-base font-semibold mt-1 capitalize">
                {build.releaseType || "N/A"}
              </p>
            </div>

            {build.platform === "android" && build.buildFormat && (
              <div>
                <h4 className="text-muted-foreground font-medium">Build Format</h4>
                <p className="text-base font-semibold mt-1 uppercase">
                  {build.buildFormat}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-muted-foreground font-medium">
                Active Status
              </h4>
              <div className="mt-1">
                {build?.isActive ? (
                  <Badge className="bg-teal-600 hover:bg-teal-700">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
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

            {build.failedAt && (
              <div className="col-span-2">
                <h4 className="text-muted-foreground font-medium">
                  Failed At
                </h4>
                <p className="text-sm mt-1">
                  {new Date(build.failedAt).toLocaleString()}
                </p>
              </div>
            )}

            {getBuildDuration() && (
              <div className="col-span-2">
                <h4 className="text-muted-foreground font-medium">
                  Build Duration
                </h4>
                <p className="text-sm mt-1">{getBuildDuration()}</p>
              </div>
            )}

            {build.buildFailed && build.errorMessage && (
              <div className="col-span-2">
                <h4 className="text-muted-foreground font-medium">
                  Error Message
                </h4>
                <p className="text-sm mt-1 bg-red-50 text-red-800 p-3 rounded-md border border-red-200">
                  {build.errorMessage}
                </p>
              </div>
            )}

            <div className="col-span-2">
              <h4 className="text-muted-foreground font-medium">Message</h4>
              <p className="text-sm mt-1 bg-muted p-3 rounded-md whitespace-pre-wrap border">
                {build?.message || "No message"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
