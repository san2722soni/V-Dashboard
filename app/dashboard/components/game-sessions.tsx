"use client"

import { useEffect, useState, useCallback } from "react"
import { getApiBaseUrl } from "@/lib/api-config"
import { authService } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Users,
  Gamepad2,
  Trophy,
  Clock,
  RefreshCw,
  Shield,
  Swords,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Copy,
  Check,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────

interface LobbyMember {
  userId: string
  isLeader?: boolean
  joinedAt: string
}

interface ActiveLobby {
  lobbyId: string
  lobbyName: string
  creatorId: string
  leaderId: string
  memberCount: number
  members: LobbyMember[]
  createdAt: string
  status: "waiting"
}

interface ActiveGame {
  gameId: string
  lobbyId: string
  serverIP: string | null
  totalPlayers: number
  realPlayerCount: number
  botCount: number
  teamA: number
  teamB: number
  status: "running"
}

interface CompletedGame {
  gameId: string
  lobbyId: string
  creatorId: string
  totalPlayers: number
  realPlayerCount: number
  botCount: number
  teamA: number
  teamB: number
  serverIP: string | null
  createdAt: string
  updatedAt: string
  status: "completed"
}

interface SessionSummary {
  activeLobbies: number
  runningGames: number
  completedGames: number
  inGameLobbies: number
  totalActivePlayers: number
  totalWaitingPlayers: number
}

interface GameSessionsData {
  summary: SessionSummary
  activeLobbies: ActiveLobby[]
  activeGames: ActiveGame[]
  completedGames: CompletedGame[]
  inGameLobbies: {
    lobbyId: string
    lobbyName: string
    creatorId: string
    memberCount: number
    gameId: string | null
    createdAt: string
    status: string
  }[]
}

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// ── Copyable ID ────────────────────────────────────────────────────

function CopyId({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  if (!value || value === "—") return <span className="text-muted-foreground">—</span>

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(`${label || "ID"} copied`)
    setTimeout(() => setCopied(false), 1500)
  }

  const display = value.length > 10 ? value.slice(0, 8) + "..." : value

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted transition-colors cursor-pointer group max-w-[140px]"
      title={value}
    >
      <span className="truncate">{display}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  )
}

// ── Status Badge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    waiting: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    running: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    completed: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    in_game: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  }
  const labels: Record<string, string> = {
    waiting: "Waiting",
    running: "Running",
    completed: "Completed",
    in_game: "In Game",
  }
  return (
    <Badge className={`text-[10px] border ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {labels[status] || status}
    </Badge>
  )
}

// ── Summary Card ───────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: number
  accent: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Table Header ───────────────────────────────────────────────────

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5 text-left whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 text-sm whitespace-nowrap ${className}`}>{children}</td>
}

// ── Empty State ────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Gamepad2 className="h-10 w-10 mb-3 opacity-20" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Lobbies Table ──────────────────────────────────────────────────

function LobbiesTable({ lobbies }: { lobbies: ActiveLobby[] }) {
  if (lobbies.length === 0) return <EmptyState message="No active lobbies right now" />

  return (
    <div className="overflow-auto max-h-[420px] scrollbar-hide rounded-md border border-border">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted/40 sticky top-0 z-10">
          <tr>
            <Th>Status</Th>
            <Th>Lobby ID</Th>
            <Th>Name</Th>
            <Th>Leader</Th>
            <Th>Creator</Th>
            <Th>Players</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {lobbies.map((l) => (
            <tr key={l.lobbyId} className="hover:bg-muted/30 transition-colors">
              <Td><StatusBadge status="waiting" /></Td>
              <Td><CopyId value={l.lobbyId} label="Lobby ID" /></Td>
              <Td className="font-medium max-w-[160px] truncate">{l.lobbyName || "—"}</Td>
              <Td><CopyId value={l.leaderId} label="Leader ID" /></Td>
              <Td><CopyId value={l.creatorId} label="Creator ID" /></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  <span className="tabular-nums">{l.memberCount}</span>
                </div>
              </Td>
              <Td className="text-muted-foreground text-xs">
                {l.createdAt ? formatDate(l.createdAt) : "—"}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Games Table ────────────────────────────────────────────────────

function GamesTable({
  games,
  variant,
}: {
  games: (ActiveGame | CompletedGame)[]
  variant: "running" | "completed"
}) {
  if (games.length === 0) {
    return (
      <EmptyState
        message={variant === "running" ? "No games running right now" : "No completed games yet"}
      />
    )
  }

  const isCompleted = variant === "completed"

  return (
    <div className="overflow-auto max-h-[420px] scrollbar-hide rounded-md border border-border">
      <table className="w-full min-w-[780px]">
        <thead className="bg-muted/40 sticky top-0 z-10">
          <tr>
            <Th>Status</Th>
            <Th>Game ID</Th>
            <Th>Lobby</Th>
            {isCompleted && <Th>Creator</Th>}
            <Th>Server</Th>
            <Th>Teams</Th>
            <Th>Players</Th>
            <Th>{isCompleted ? "Finished" : "Started"}</Th>
            {isCompleted && <Th>Duration</Th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {games.map((g) => {
            const completed = g as CompletedGame
            let duration = ""
            if (isCompleted && completed.createdAt && completed.updatedAt) {
              const ms =
                new Date(completed.updatedAt).getTime() - new Date(completed.createdAt).getTime()
              const totalMins = Math.floor(ms / 60000)
              if (totalMins < 60) duration = `${totalMins}m`
              else duration = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`
            }

            return (
              <tr key={g.gameId} className="hover:bg-muted/30 transition-colors">
                <Td><StatusBadge status={variant} /></Td>
                <Td><CopyId value={g.gameId} label="Game ID" /></Td>
                <Td><CopyId value={g.lobbyId} label="Lobby ID" /></Td>
                {isCompleted && (
                  <Td><CopyId value={completed.creatorId} label="Creator ID" /></Td>
                )}
                <Td>
                  {g.serverIP ? (
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                      <CopyId value={g.serverIP} label="Server IP" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <WifiOff className="h-3.5 w-3.5" /> None
                    </span>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center gap-2 text-xs tabular-nums">
                    <span className="inline-flex items-center gap-0.5 text-blue-400">
                      <Shield className="h-3 w-3" /> {g.teamA}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="inline-flex items-center gap-0.5 text-red-400">
                      <Swords className="h-3 w-3" /> {g.teamB}
                    </span>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs tabular-nums">
                    <span>{g.realPlayerCount} real</span>
                    {g.botCount > 0 && (
                      <span className="text-muted-foreground">+ {g.botCount} bot</span>
                    )}
                  </div>
                </Td>
                <Td className="text-muted-foreground text-xs">
                  {"createdAt" in g && g.createdAt ? formatDate(g.createdAt) : "—"}
                </Td>
                {isCompleted && (
                  <Td className="text-xs tabular-nums text-muted-foreground">{duration || "—"}</Td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────

export function GameSessions() {
  const [data, setData] = useState<GameSessionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const res = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/gameSessions/getAll`
      )
      const json = await res.json()

      if (json.success) {
        setData(json.data)
      } else {
        setError(json.message || "Failed to load game sessions")
      }
    } catch (err: any) {
      setError(err.message || "Network error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Game Sessions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-7 w-10 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading sessions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Game Sessions</h2>
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const { summary, activeLobbies, activeGames, completedGames } = data

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold">Game Sessions</h2>
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Active Lobbies" value={summary.activeLobbies} accent="bg-blue-500" />
        <StatCard icon={Gamepad2} label="Running Games" value={summary.runningGames} accent="bg-emerald-500" />
        <StatCard icon={Trophy} label="Completed" value={summary.completedGames} accent="bg-amber-500" />
        <StatCard
          icon={Users}
          label="Active Players"
          value={summary.totalActivePlayers + summary.totalWaitingPlayers}
          accent="bg-purple-500"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lobbies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lobbies" className="text-xs gap-1.5">
            Lobbies
            {summary.activeLobbies > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                {summary.activeLobbies}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="running" className="text-xs gap-1.5">
            Running
            {summary.runningGames > 0 && (
              <Badge className="h-4 min-w-4 px-1 text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {summary.runningGames}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs gap-1.5">
            Completed
            {summary.completedGames > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                {summary.completedGames}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Lobbies Tab */}
        <TabsContent value="lobbies">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Active Lobbies
                <span className="text-muted-foreground font-normal text-xs">
                  — waiting for game start
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LobbiesTable lobbies={activeLobbies} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Running Games Tab */}
        <TabsContent value="running">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-emerald-400" />
                Running Games
                <span className="text-muted-foreground font-normal text-xs">
                  — currently in progress
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <GamesTable games={activeGames} variant="running" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Games Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Completed Games
                <span className="text-muted-foreground font-normal text-xs">
                  — recent finished games
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <GamesTable games={completedGames} variant="completed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
