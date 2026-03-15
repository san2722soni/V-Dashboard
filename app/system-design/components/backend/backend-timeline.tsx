"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BackendTimelinePhase {
  phase: string
  phaseNumber: number
  description: string
  services: string[]
  endpoints: Array<{
    name: string
    method: string
    path: string
  }>
}

interface BackendTimelineSidebarProps {
  onNodeClick?: (node: any) => void
}

export default function BackendTimelineSidebar({ onNodeClick }: BackendTimelineSidebarProps) {
  const phases: BackendTimelinePhase[] = [
    {
      phase: "Authentication Gate",
      phaseNumber: 1,
      description: "Secure authentication entry point. Users and developers authenticate via OTP verification to receive session tokens for all subsequent API calls.",
      services: ["🔐 Auth Service"],
      endpoints: [
        { name: "User Login", method: "POST", path: "/auth/user/login" },
        { name: "User Verify OTP", method: "POST", path: "/auth/user/verifyOtp" },
        { name: "Dev Login", method: "POST", path: "/auth/developer/login" },
        { name: "Dev Verify", method: "POST", path: "/auth/developer/verifyDeveloper" },
      ],
    },
    {
      phase: "Game Info & Server",
      phaseNumber: 2,
      description: "Retrieve game metadata and server status. Provides character information, server data, and game state needed for client initialization.",
      services: ["🎮 Game Service"],
      endpoints: [
        { name: "Get Characters", method: "GET", path: "/game/info/characters" },
        { name: "Get Server Data", method: "GET", path: "/game/info/server" },
      ],
    },
    {
      phase: "Matchmaking System",
      phaseNumber: 3,
      description: "Player-to-player matching engine. Initiates searches, tracks matchmaking status, and allows players to cancel searches during queue.",
      services: ["🎮 Game Service"],
      endpoints: [
        { name: "Find Match", method: "POST", path: "/game/matchmaking/findAMatch" },
        { name: "Match Status", method: "GET", path: "/game/matchmaking/status" },
        { name: "Cancel Search", method: "POST", path: "/game/matchmaking/cancelSearch" },
      ],
    },
    {
      phase: "Character Selection",
      phaseNumber: 4,
      description: "Pre-game character selection. Players choose their character before entering a match or lobby.",
      services: ["🎮 Game Service"],
      endpoints: [
        { name: "Select Character", method: "POST", path: "/game/character/select" },
      ],
    },
    {
      phase: "Lobby Management",
      phaseNumber: 5,
      description: "Multiplayer lobby coordination. Create lobbies, invite players, manage lobby state, and initiate matches from group readiness.",
      services: ["🎮 Game Service"],
      endpoints: [
        { name: "Create Lobby", method: "POST", path: "/game/lobby/createLobby" },
        { name: "Join Lobby", method: "POST", path: "/game/lobby/joinLobby" },
        { name: "Lobby Status", method: "GET", path: "/game/lobby/status" },
        { name: "Start Match", method: "POST", path: "/game/lobby/startMatch" },
        { name: "Leave Lobby", method: "POST", path: "/game/lobby/leaveLobby" },
      ],
    },
    {
      phase: "Active Gameplay",
      phaseNumber: 6,
      description: "Real-time game actions during active match. Handle player eliminations, game state updates, and match completion.",
      services: ["🎮 Game Service"],
      endpoints: [
        { name: "Kill Player", method: "POST", path: "/game/killPlayer" },
        { name: "Game Over", method: "POST", path: "/game/gameOver" },
      ],
    },
    {
      phase: "Entity Management",
      phaseNumber: 7,
      description: "Persistent character data storage and retrieval. CRUD operations for game entities with MongoDB backing.",
      services: ["🏷️ Entity Service"],
      endpoints: [
        { name: "Get Character", method: "GET", path: "/entity/character" },
        { name: "Create Character", method: "POST", path: "/entity/character" },
        { name: "Delete Character", method: "DELETE", path: "/entity/character" },
      ],
    },
    {
      phase: "Developer Dashboard",
      phaseNumber: 8,
      description: "Admin control panel with feature flags, developer management, build deployment, and database queries for development operations.",
      services: ["📊 Dashboard Service"],
      endpoints: [
        { name: "Get Feature Flags", method: "POST", path: "/dashboard/featureFlag/getFeatureFlags" },
        { name: "Create Flag", method: "POST", path: "/dashboard/featureFlag/createFlag" },
        { name: "Update Flag", method: "PUT", path: "/dashboard/featureFlag/updateFlag" },
        { name: "Delete Flag", method: "DELETE", path: "/dashboard/featureFlag/deleteFlag" },
        { name: "Get Flag by Name", method: "GET", path: "/dashboard/featureFlag/getByName" },
        { name: "Get Developers", method: "POST", path: "/dashboard/developer/getDevelopers" },
        { name: "Get Dev by ID", method: "GET", path: "/dashboard/developer/getById" },
        { name: "Create Developer", method: "POST", path: "/dashboard/developer/create" },
        { name: "Update Developer", method: "PUT", path: "/dashboard/developer/update" },
        { name: "Delete Developer", method: "DELETE", path: "/dashboard/developer/delete" },
        { name: "Mongo Query", method: "POST", path: "/dashboard/mongo/query" },
        { name: "Create Build", method: "POST", path: "/dashboard/builds/create" },
        { name: "Get Builds", method: "GET", path: "/dashboard/builds" },
        { name: "Delete Build", method: "DELETE", path: "/dashboard/builds/delete" },
        { name: "New Request", method: "POST", path: "/dashboard/requests/new" },
      ],
    },
    {
      phase: "Complete Integration",
      phaseNumber: 9,
      description: "Full system orchestration. All services coordinated with auth gates, real-time updates, persistent storage, and administrative oversight.",
      services: ["🔐 Auth", "🎮 Game", "🏷️ Entity", "📊 Dashboard"],
      endpoints: [
        { name: "End-to-End Flow", method: "*", path: "/* coordinated */" },
      ],
    },
  ]

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-background/50">
        <h3 className="font-bold text-foreground">Backend Workflow</h3>
        <p className="text-xs text-muted-foreground">Service execution timeline (30+ endpoints)</p>
      </div>

      {/* Phases */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {phases.map((phase) => (
            <div key={phase.phaseNumber} className="relative">
              {/* Timeline connector */}
              {phase.phaseNumber < phases.length && (
                <div className="absolute left-4 top-12 w-0.5 h-8 bg-gradient-to-b from-primary/60 to-transparent" />
              )}

              {/* Phase item */}
              <div className="relative pl-12">
                {/* Dot indicator */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                  {phase.phaseNumber}
                </div>

                {/* Phase content */}
                <Card className="p-3 bg-secondary/30 border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <h4 className="font-bold text-sm text-foreground mb-1">{phase.phase}</h4>
                  <p className="text-xs text-muted-foreground leading-snug mb-2">{phase.description}</p>

                  {/* Services */}
                  <div className="mb-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-1">Services:</p>
                    <div className="space-y-1">
                      {phase.services.map((service, idx) => (
                        <div key={idx} className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                          → {service}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Endpoints */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-2">Endpoints ({phase.endpoints.length}):</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {phase.endpoints.map((endpoint, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-background/50 border border-border/50 rounded px-2 py-1.5 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-bold px-1.5 py-0.5 rounded text-white text-[10px] ${
                              endpoint.method === "GET" ? "bg-blue-500" :
                              endpoint.method === "POST" ? "bg-green-500" :
                              endpoint.method === "PUT" ? "bg-yellow-500" :
                              endpoint.method === "DELETE" ? "bg-red-500" :
                              "bg-gray-500"
                            }`}>
                              {endpoint.method}
                            </span>
                            <span className="font-semibold text-foreground">{endpoint.name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono ml-10">{endpoint.path}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {/* Final completion indicator */}
          <div className="relative pl-12 pt-2">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
              ✓
            </div>
            <Card className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <p className="text-xs font-medium text-green-900 dark:text-green-100">Full Backend Integration Complete</p>
              <p className="text-xs text-green-800/70 dark:text-green-200/70 mt-1">
                40+ endpoints coordinated across 4 microservices. Authentication gates all operations. Real-time game updates with persistent entity storage and full admin oversight.
              </p>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
