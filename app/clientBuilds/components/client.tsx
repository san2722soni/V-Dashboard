"use client";

import { Server, RotateCcw, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns, type Build } from "./column";
import { BuildModal } from "./build-modal";
import { LogsModal } from "./LogsModal";
import { NewBuild } from "./new-buildModal";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-config";

interface BuildStatus {
  status: string;
  version: string | null;
  buildId: string | null;
  elapsedTime: number | null;
  endTime?: number | null;
  platform?: string | null;
}

export const BuildPageClient = () => {
  const router = useRouter();

  const [data, setData] = useState<Build[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    status: "idle",
    version: null,
    buildId: null,
    elapsedTime: null,
  });

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/getBuilds`
      );
      if (response.ok) {
        const result = await response.json();
        setData((result.data || []).reverse());
      }
    } catch (error) {
      console.error("Failed to fetch builds", error);
      toast.error("Failed to fetch builds");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildStatus = async () => {
    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/getCurrentStatus`
      );
      if (response.ok) {
        const result = await response.json();
        setBuildStatus(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch build status", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this build?")) {
      return;
    }

    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/deleteBuild`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buildId: id }),
        }
      );

      if (response.ok) {
        toast.success("Build deleted successfully");
        fetchBuilds();
      } else {
        toast.error("Failed to delete build");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleCheck = async (id: string) => {
    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/setActive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buildId: id }),
        }
      );

      if (response.ok) {
        toast.success("Build activated successfully");
        fetchBuilds();
      } else {
        toast.error("Failed to activate build");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleViewDetails = (build: Build) => {
    setSelectedBuild(build);
    setIsDetailModalOpen(true);
  };

  const handleViewLogs = (build: Build) => {
    setSelectedBuild(build);
    setIsLogsModalOpen(true);
  };

  const handleDownload = async (build: Build) => {
    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/getDownloadUrl`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buildId: build._id }),
        }
      );

      const result = await response.json();

      if (response.ok && result?.success) {
        window.open(result.data.downloadUrl, "_blank");
      } else {
        toast.error(result?.message || "Failed to get download URL");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Download error:", error);
    }
  };

  const handleCopyUrl = async (build: Build) => {
    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/getDownloadUrl`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buildId: build._id }),
        }
      );

      const result = await response.json();

      if (response.ok && result?.success) {
        navigator.clipboard.writeText(result.data.downloadUrl);
        toast.success("Build URL copied to clipboard");
      } else {
        toast.error(result?.message || "Failed to get build URL");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Copy URL error:", error);
    }
  };

  const handleForceReset = async () => {
    if (!confirm("Are you sure you want to force reset the build status? This will mark the current build as failed.")) {
      return;
    }

    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/clientBuild/forceReset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        toast.success("Build status reset successfully");
        fetchBuildStatus();
      } else {
        const error = await response.json();
        toast.error(error?.message || "Failed to reset build status");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Force reset error:", error);
    }
  };

  const columnsWithActions = columns(
    handleViewDetails,
    handleDelete,
    handleCheck,
    handleViewLogs,
    handleDownload,
    handleCopyUrl
  );

  useEffect(() => {
    fetchBuilds();
    fetchBuildStatus();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBuildStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatElapsedTime = (ms: number | null) => {
    if (!ms) return "";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getPlatformLabel = () => {
    if (!buildStatus.platform) return "";
    return buildStatus.platform === "android" ? "Android" : "Windows";
  };

  const getStatusBadge = () => {
    const platformLabel = getPlatformLabel();

    switch (buildStatus.status) {
      case "startingInstance":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500 hover:bg-purple-600">
              <Rocket className="mr-2 h-3 w-3 animate-pulse" />
              Starting EC2 Instance {buildStatus.version}
              {platformLabel && (
                <span className="ml-2 text-xs opacity-80">
                  ({platformLabel})
                </span>
              )}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceReset}
              className="text-xs"
            >
              Force Reset
            </Button>
          </div>
        );

      case "instanceReady":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500 hover:bg-cyan-600">
              <CheckCircle2 className="mr-2 h-3 w-3" />
              Instance Ready {buildStatus.version}
              {platformLabel && (
                <span className="ml-2 text-xs opacity-80">
                  ({platformLabel})
                </span>
              )}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceReset}
              className="text-xs"
            >
              Force Reset
            </Button>
          </div>
        );

      case "building":
        const elapsedStr = buildStatus.elapsedTime ? ` (${formatElapsedTime(buildStatus.elapsedTime)})` : "";
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500 hover:bg-blue-600">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Building {buildStatus.version}{elapsedStr}
              {platformLabel && (
                <span className="ml-2 text-xs opacity-80">
                  [{platformLabel}]
                </span>
              )}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceReset}
              className="text-xs"
            >
              Force Reset
            </Button>
          </div>
        );

      case "done":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Last Build Complete
          </Badge>
        );

      case "failed":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            Last Build Failed
          </Badge>
        );

      default: // idle
        return (
          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            Idle
            {buildStatus.endTime && (
              <span className="ml-2 text-xs opacity-70">
                (Auto-shutdown in {Math.max(0, Math.ceil((300000 - (Date.now() - buildStatus.endTime)) / 60000))}m)
              </span>
            )}
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Heading
            title={`Client Builds (${data.length})`}
            description="Manage Client Builds"
          />
          {getStatusBadge()}
        </div>
        <Button
          onClick={() => setIsNewModalOpen(true)}
          disabled={
            buildStatus.status === "building" ||
            buildStatus.status === "startingInstance" ||
            buildStatus.status === "instanceReady"
          }
        >
          <Server className="mr-2 h-4 w-4" /> New Build
        </Button>
      </div>
      <div className="flex flex-row justify-between items-center space-x-4">
        <div className="w-full">
          <Separator />

          <DataTable
            searchKey="version"
            columns={columnsWithActions}
            data={data}
          />

          <NewBuild
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            onSuccess={() => {
              fetchBuilds();
              fetchBuildStatus();
            }}
          />
          <BuildModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            build={selectedBuild}
          />
          <LogsModal
            isOpen={isLogsModalOpen}
            onClose={() => setIsLogsModalOpen(false)}
            build={selectedBuild}
          />
        </div>
      </div>
    </>
  );
};
