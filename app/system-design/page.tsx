"use client";

import { useState, useCallback, useEffect } from "react";
import { ReactFlowDiagram } from "./components/react-flow-diagram";
import TimelineSidebar from "./components/timeline-sidedbar";
import NodeModal from "./components/node-modal";
import { useFlowData } from "@/hooks/use-flow-data";
import "@xyflow/react/dist/style.css";
import {
  Book,
  BookOpen,
  NotebookText,
  Workflow,
  Server,
  Cloud,
  GitBranch,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackendFlowDiagram } from "./components/backend/backend-flow-diagram";
import BackendTimelineSidebar from "./components/backend/backend-timeline";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { getFeatureFlagValue } from "@/lib/feature-flag";
import VCMWorkflow from "./vcm/vcmDesign";
import { getApiBaseUrl } from "@/lib/api-config";

export default function Home() {
  const router = useRouter();

  const { nodes, edges, timeline } = useFlowData();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState("unity");

  useEffect(() => {
    async function checkAccess() {
      const url = `${getApiBaseUrl()}/dashboard/featureFlag/getFeatureFlagByName`;

      let requiresAuth = true; // DEFAULT: secure

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "system_design_requires_auth" }),
        });

        // If backend returns 401 or fails → secure default stays TRUE
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            requiresAuth = String(json.data.value).toLowerCase() === "true";
          }
        }
      } catch (err) {
        console.error("Flag read failed, defaulting to secure mode", err);
      }

      // If login required → but user not logged in → redirect
      if (requiresAuth && !authService.isAuthenticated()) {
        router.push("/sign-in");
      }
    }

    checkAccess();
  }, [router]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleViewPDF = useCallback(() => {
    window.open(
      "https://drive.google.com/file/d/1iiG4k9rOu-JTPfHKuybdpBfcvuKOP2eB/view?usp=sharing",
      "_blank"
    );
  }, []);

  const handleViewWorkflow = useCallback(() => {
    window.open(
      "https://drive.google.com/file/d/1iPtgtk_FGlQpPBB5Avwhd8YUr88mc8DN/view?usp=sharing",
      "_blank"
    );
  }, []);

  const renderFlowContent = () => {
    switch (activeTab) {
      case "unity":
        return (
          <ReactFlowDiagram
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            shouldMove={showTimeline}
          />
        );
      case "backend":
        return <BackendFlowDiagram />;
      case "vcm":
        return (
          // <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg">
          //   <div className="text-center p-8">
          //     <Cloud className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          //     <h3 className="text-xl font-semibold text-gray-700 mb-2">
          //       AWS Architecture
          //     </h3>
          //     <p className="text-gray-500">
          //       AWS workflow diagram coming soon...
          //     </p>
          //   </div>
          // </div>
          <VCMWorkflow />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container-fluid flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 bg-card shadow-sm">
          <div className="max-w-full mx-auto flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Project V Architecture
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete system architecture visualization
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewPDF}
                className="flex flex-row items-center justify-center ml-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-200 text-sm"
              >
                <NotebookText className="mr-2 w-5 h-5" /> Read PDF
              </button>
              <button
                onClick={handleViewWorkflow}
                className="flex flex-row items-center justify-center ml-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-200 text-sm"
              >
                <Workflow className="mr-2 w-5 h-5" /> Workflow
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-border bg-background">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
              <TabsTrigger
                value="unity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Workflow className="w-4 h-4 mr-2" />
                Unity Workflow
              </TabsTrigger>
              <TabsTrigger
                value="backend"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Server className="w-4 h-4 mr-2" />
                Backend Workflow
              </TabsTrigger>
              <TabsTrigger
                value="vcm"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                VCM Workflow
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-1 overflow-hidden gap-1 bg-background">
          {/* Flow Diagram - 70% */}
          <div
            className={`transition-all duration-300 ease-out overflow-hidden ${
              showTimeline ? "w-[70%]" : "w-full"
            }`}
          >
            <div className="h-full rounded-none overflow-hidden border-r border-border">
              {renderFlowContent()}
            </div>
          </div>

          {/* Timeline Sidebar - 30% (for Unity and Backend) */}
          {(activeTab === "unity" || activeTab === "backend") && (
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                showTimeline ? "w-[30%] opacity-100" : "w-0 opacity-0"
              }`}
            >
              {activeTab === "unity" && (
                <TimelineSidebar
                  phases={timeline}
                  onNodeClick={handleNodeClick}
                />
              )}
              {activeTab === "backend" && (
                <BackendTimelineSidebar onNodeClick={handleNodeClick} />
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowTimeline(!showTimeline)}
        className="fixed bottom-8 right-8 z-40 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200 flex flex-row items-center justify-center"
      >
        {showTimeline ? "Hide Timeline" : "Show Timeline"}{" "}
        {activeTab === "unity" ? (
          <Workflow className="ml-2 w-5 h-5" />
        ) : (
          <Server className="ml-2 w-5 h-5" />
        )}
      </button>

      <NodeModal
        isOpen={isModalOpen}
        node={selectedNode}
        onClose={handleCloseModal}
      />
    </main>
  );
}
