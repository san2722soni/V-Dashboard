"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns } from "./column";
import { NewQueryModal } from "./new-query-modal";
import { EditQueryModal } from "./edit-query-modal";
import { ViewQueryModal } from "./view-query-modal";
import { ExecuteSheet } from "./execute-sheet";
import { authService } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Query, User } from "@/lib/Types";

export const QueryClient = () => {
  const router = useRouter();

  const [data, setData] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"mongo" | "redis">("mongo");

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExecuteSheetOpen, setIsExecuteSheetOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/query/getQueries`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch queries");
        }
      } else {
        toast.error("Failed to fetch queries");
      }
    } catch (error) {
      console.error("Failed to fetch queries:", error);
      toast.error("Failed to fetch queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "developer")) {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    fetchQueries();
  }, [router]);

  const handleView = (query: Query) => {
    setSelectedQuery(query);
    setIsViewModalOpen(true);
  };

  const handleEdit = (query: Query) => {
    setSelectedQuery(query);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (queryId: string) => {
    if (!confirm("Are you sure you want to delete this query?")) return;

    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/query/deleteQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: queryId }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Query deleted successfully");
          fetchQueries();
        } else {
          toast.error(result.message || "Failed to delete query");
        }
      } else {
        toast.error("Failed to delete query");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleApprove = async (query: Query) => {
    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/query/approveQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: query._id, status: "approved" }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Query approved successfully");
          fetchQueries();
        } else {
          toast.error(result.message || "Failed to approve query");
        }
      } else {
        toast.error("Failed to approve query");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleExecute = (query: Query) => {
    setSelectedQuery(query);
    setIsExecuteSheetOpen(true);
  };

  const mongoQueries = data.filter((q) => q.type === "mongo");
  const redisQueries = data.filter((q) => q.type === "redis");

  const columnsWithActions = columns(
    currentUser,
    handleView,
    handleEdit,
    handleDelete,
    handleApprove,
    handleExecute
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Queries (${data.length})`}
          description="Create and execute database queries"
        />
        <Button onClick={() => setIsNewModalOpen(true)} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          {loading ? "Loading..." : "New Query"}
        </Button>
      </div>
      <Separator />

      <Tabs
        defaultValue="mongo"
        onValueChange={(v) => setActiveTab(v as "mongo" | "redis")}
      >
        <TabsList>
          <TabsTrigger value="mongo">
            MongoDB ({mongoQueries.length})
          </TabsTrigger>
          <TabsTrigger value="redis">
            Redis ({redisQueries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mongo">
          <DataTable
            searchKey="description"
            columns={columnsWithActions}
            data={mongoQueries}
          />
        </TabsContent>

        <TabsContent value="redis">
          <DataTable
            searchKey="description"
            columns={columnsWithActions}
            data={redisQueries}
          />
        </TabsContent>
      </Tabs>

      <NewQueryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchQueries}
        defaultType={activeTab}
      />

      <EditQueryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchQueries}
        query={selectedQuery}
      />

      <ViewQueryModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        query={selectedQuery}
      />

      <ExecuteSheet
        isOpen={isExecuteSheetOpen}
        onClose={() => setIsExecuteSheetOpen(false)}
        query={selectedQuery}
      />
    </>
  );
};
