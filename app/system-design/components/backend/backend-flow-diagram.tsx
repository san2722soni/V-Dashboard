"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";

import "@/app/globals.css";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import { APIModal } from "./backend-modal";

// Role types
type UserRole = "developer" | "admin" | "user";

// Backend data shape
interface BackendData {
  services: any[];
  endpoints: any[];
  edges: any[];
}

function CustomNode({ data }: any) {
  const isCollapsed = data.isCollapsed;
  const childCount = data.childCount || 0;
  const isExpandable = data.type === "group" && childCount > 0;

  return (
    <div
      onClick={data.onClick}
      className={`
        px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 bg-white
        hover:shadow-lg hover:scale-105 max-w-48 text-center border-2 transform-gpu
        ${
          data.type === "service"
            ? "border-blue-500 shadow-blue-100"
            : data.type === "group"
            ? "border-green-500 shadow-green-100"
            : "border-gray-400"
        }
        ${isExpandable ? "hover:border-green-700" : ""}
      `}
      style={{
        transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-xs font-bold text-gray-900">
        {data.emoji} {data.title}
      </div>
      {data.type === "group" && (
        <div className="text-xs text-green-600 mt-1 font-semibold">
          {childCount} endpoints {isCollapsed ? "▼" : "▲"}
        </div>
      )}
      {data.method && (
        <div
          className={`text-xs mt-1 px-2 py-1 rounded font-medium ${
            data.method === "GET"
              ? "bg-green-100 text-green-800"
              : data.method === "POST"
              ? "bg-blue-100 text-blue-800"
              : data.method === "PUT"
              ? "bg-yellow-100 text-yellow-800"
              : data.method === "DELETE"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {data.method}
        </div>
      )}
      {data.requiresAuth && <div className="text-xs mt-1 text-orange-600">🔐</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

interface BackendFlowDiagramProps {
  onNodeClick?: (node: any) => void;
  apiUrl?: string;
}

export function BackendFlowDiagram({
  onNodeClick,
  apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/docs/structure`,
}: BackendFlowDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [backendData, setBackendData] = useState<BackendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Search term state (top-right)
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch API structure
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();

        if (!data.services || !data.endpoints || !data.edges)
          throw new Error("Invalid API structure format");

        setBackendData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [apiUrl]);

  // Collapsed groups (user toggles). We will *not* mutate this automatically on search.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (backendData?.endpoints) {
      setCollapsedGroups(
        new Set(
          backendData.endpoints
            .filter((n: any) => n.type === "group")
            .map((n: any) => n.id)
        )
      );
    }
  }, [backendData]);

  const handleRoleChange = (role: UserRole) => setUserRole(role);

  const handleNodeClick = useCallback(
    async (node: any) => {
      if (node.type === "group") {
        setIsAnimating(true);
        await new Promise((r) => setTimeout(r, 120));
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.has(node.id) ? next.delete(node.id) : next.add(node.id);
          return next;
        });
        setTimeout(() => setIsAnimating(false), 350);
      } else {
        setSelectedNode(node);
        setIsModalOpen(true);
        onNodeClick?.(node);
      }
    },
    [onNodeClick]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  // role-permission helper:
  const roleAllowsNode = (role: UserRole, node: any) => {
    // public if allowedRoles missing or empty
    if (!node.allowedRoles || node.allowedRoles.length === 0) return true;
    if (role === "admin") return true;
    if (role === "developer") {
      // developer can see developer, user and public
      return node.allowedRoles.includes("developer") || node.allowedRoles.includes("user");
    }
    // user
    return node.allowedRoles.includes("user");
  };

  // Role filtered nodes + edges
  const roleBasedData = useMemo(() => {
    if (!backendData) return { nodes: [], edges: [] };
    const allNodes = [...backendData.services, ...backendData.endpoints];
    const allowedNodes = allNodes.filter((n) => roleAllowsNode(userRole, n));
    const allowedIds = new Set(allowedNodes.map((n) => n.id));
    const allowedEdges = backendData.edges.filter((e) => allowedIds.has(e.source) && allowedIds.has(e.target));
    return { nodes: allowedNodes, edges: allowedEdges };
  }, [backendData, userRole]);

  // SEARCH: compute which nodes match. Behavior: hide non-matching nodes completely.
  // If searching endpoints, also expand groups that contain matches (we don't call setState; we compute effective visibility)
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const { filteredNodes, filteredEdges, groupsToForceOpen } = useMemo(() => {
    const nodes = roleBasedData.nodes || [];
    const edges = roleBasedData.edges || [];

    if (!normalizedSearch) {
      return { filteredNodes: nodes, filteredEdges: edges, groupsToForceOpen: new Set<string>() };
    }

    const matchNode = (n: any) => {
      // check common fields: id, title/name, path, method, description, service
      const fieldsToCheck: string[] = [];
      if (n.title) fieldsToCheck.push(String(n.title));
      if (n.name) fieldsToCheck.push(String(n.name));
      if (n.path) fieldsToCheck.push(String(n.path));
      if (n.method) fieldsToCheck.push(String(n.method));
      if (n.description) fieldsToCheck.push(String(n.description));
      if (n.id) fieldsToCheck.push(String(n.id));
      if (n.emoji) fieldsToCheck.push(String(n.emoji));
      const hay = fieldsToCheck.join(" ").toLowerCase();
      return hay.includes(normalizedSearch);
    };

    // first pass: endpoints/services that directly match
    const directMatches = new Set<string>();
    nodes.forEach((n) => {
      if (matchNode(n)) directMatches.add(n.id);
    });

    // If endpoints belong to groups, we want to show their groups too.
    const groupsOpen = new Set<string>();
    nodes.forEach((n) => {
      if (n.type === "endpoint" && n.parentId && directMatches.has(n.id)) {
        groupsOpen.add(n.parentId);
      }
    });

    // final visible nodes: nodes that match directly OR services OR groups that contain matches
    const visible = nodes.filter((n) => {
      if (directMatches.has(n.id)) return true;
      if (n.type === "service") return true; // keep services for context
      if (n.type === "group" && groupsOpen.has(n.id)) return true;
      // optionally, keep endpoints whose parent group is open
      if (n.type === "endpoint" && n.parentId && groupsOpen.has(n.parentId)) {
        // but only include if the endpoint itself matches or group contains match — include all endpoints under the matching group
        return true;
      }
      return false;
    });

    // build edges connecting visible nodes only
    const visibleIds = new Set(visible.map((v) => v.id));
    const visibleEdges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));

    return { filteredNodes: visible, filteredEdges: visibleEdges, groupsToForceOpen: groupsOpen };
  }, [roleBasedData, normalizedSearch]);

  // Child count function
  const getChildCount = useCallback(
    (groupId: string) => {
      if (!backendData) return 0;
      return backendData.endpoints.filter((e) => e.parentId === groupId).length;
    },
    [backendData]
  );

  // DAGRE layout (same as before)
  const getLayoutedElements = useCallback((nodes: any[], edges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: "TB",
      nodesep: 80,
      ranksep: 100,
      marginx: 50,
      marginy: 50,
    });

    const nodeWidth = 180;
    const nodeHeight = 100;

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // center
    let minX = Infinity,
      maxX = -Infinity;
    nodes.forEach((node) => {
      const n = dagreGraph.node(node.id);
      if (n) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
      }
    });
    const totalWidth = isFinite(minX) && isFinite(maxX) ? maxX - minX : 1200;
    const centerOffset = -totalWidth / 2 + 1200;

    return nodes.map((node) => {
      const n = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: n ? n.x + centerOffset : 0,
          y: n ? n.y : 0,
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      };
    });
  }, []);

  // Build RF nodes/edges from filteredNodes/filteredEdges
  const { rfNodes, rfEdges } = useMemo(() => {
    if (!filteredNodes || !filteredEdges) return { rfNodes: [], rfEdges: [] };

    // Map to base nodes
    const baseNodes = filteredNodes.map((node: any) => ({
      id: node.id,
      data: {
        ...node,
        // when searching we want groupsToForceOpen to override collapsedGroups
        isCollapsed: (() => {
          // if search active and group in groupsToForceOpen -> force open
          if (normalizedSearch && node.type === "group") {
            return !groupsToForceOpen.has(node.id);
          }
          return collapsedGroups.has(node.id);
        })(),
        onClick: () => handleNodeClick(node),
        childCount: node.type === "group" ? getChildCount(node.id) : 0,
      },
      type: "default" as const,
      position: { x: 0, y: 0 },
    }));

    const layouted = getLayoutedElements(baseNodes, filteredEdges);

    const edges = filteredEdges.map((e) => ({
      id: `e${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      animated: true,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#4B5563" },
      style: { stroke: "#4B5563", strokeWidth: 2.5 },
    }));

    return { rfNodes: layouted, rfEdges: edges };
  }, [
    filteredNodes,
    filteredEdges,
    collapsedGroups,
    getChildCount,
    handleNodeClick,
    getLayoutedElements,
    normalizedSearch,
  ]);

  // Do not sync via state to avoid loops — pass rfNodes/rfEdges directly
  const flowNodes = rfNodes;
  const flowEdges = rfEdges;

  const defaultViewport = useMemo(() => ({ x: 310, y: 200, zoom: 0.8 }), []);

  // Export JSON
  const exportJSON = () => {
    const data = { nodes: flowNodes, edges: flowEdges, role: userRole, search: searchTerm || null };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `api-graph-${Date.now()}.json`;
    a.click();
  };

  // Export PNG using html-to-image dynamically (to avoid SSR issues)
  const exportPNG = async () => {
    try {
      // dynamic import
      const mod = await import("html-to-image");
      const node = document.querySelector(".react-flow__renderer") as HTMLElement | null;
      if (!node) {
        alert("Unable to find diagram area to export.");
        return;
      }
      const blobUrl = await mod.toPng(node, { filter: (n: any) => true });
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `api-graph-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("Export PNG failed", err);
      alert("Export PNG failed. Check console.");
    }
  };

  // counts for UI
  const visibleServiceCount = useMemo(() => (flowNodes || []).filter((n: any) => n.data?.type === "service" || n.data?.type === "service").length, [flowNodes]);
  const visibleEndpointCount = useMemo(() => (flowNodes || []).filter((n: any) => n.data?.type === "endpoint").length, [flowNodes]);

  // loading / error views
  if (loading)
    return (
      <div className="w-full h-full rounded-lg overflow-hidden bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API structure...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="w-full h-full rounded-lg overflow-hidden bg-white flex items-center justify-center">
        <div className="text-center text-red-600 p-8">
          <p className="text-lg font-semibold">Failed to load API structure</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-white relative">
      {/* TOP TOOLBAR — Option C: Role buttons (left), search + counts + exports (right) */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm px-6 py-3 border-b flex items-center justify-between gap-4">
        {/* left: roles */}
        <div className="flex items-center gap-3">
          <button onClick={() => handleRoleChange("admin")} className={`text-sm px-3 py-1 rounded ${userRole === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Admin
          </button>
          <button onClick={() => handleRoleChange("developer")} className={`text-sm px-3 py-1 rounded ${userRole === "developer" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Developer
          </button>
          <button onClick={() => handleRoleChange("user")} className={`text-sm px-3 py-1 rounded ${userRole === "user" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            User
          </button>
        </div>

        {/* right: search + counts + export buttons */}
        <div className="flex items-center gap-3">
          {/* search */}
          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search endpoints/services..."
              className="text-sm px-3 py-1.5 rounded border focus:outline-none w-72"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-1 top-1 text-xs text-gray-500 px-1">✕</button>
            )}
          </div>

          {/* counts */}
          <div className="text-xs text-gray-600 px-3 py-1 rounded bg-white border">
            <span className="font-semibold text-blue-600">{visibleServiceCount}</span> services • <span className="font-semibold text-green-600">{visibleEndpointCount}</span> endpoints
          </div>

          {/* export PNG */}
          <button onClick={exportPNG} className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600">
            Export PNG
          </button>

          {/* export JSON */}
          <button onClick={exportJSON} className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-800">
            Export JSON
          </button>
        </div>
      </div>

      {/* React Flow */}
      <div className="absolute inset-0 top-14"> {/* offset to leave space for toolbar */}
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={{ default: CustomNode }}
          defaultViewport={defaultViewport}
          fitView={false}
          panOnDrag
          minZoom={0.35}
          maxZoom={2}
          className={isAnimating ? "opacity-90 transition-all" : ""}
        >
          <MiniMap zoomable pannable nodeColor={(n: any) => (n.data?.type === "service" ? "#0ea5e9" : n.data?.type === "group" ? "#22c55e" : "#64748b")} maskColor="rgba(0,0,0,0.12)" />
          <Background color="#e0e0e0" gap={16} size={1} variant={BackgroundVariant.Dots} />
          <Controls position="bottom-right" showInteractive={true} showFitView />
        </ReactFlow>
      </div>

      {/* modal */}
      <APIModal node={selectedNode} isOpen={isModalOpen} onClose={handleCloseModal} userRole={userRole} />
    </div>
  );
}
