"use client"

import { useEffect, useState, useCallback } from "react"
import { getApiBaseUrl } from "@/lib/api-config"
import { authService } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Users,
  Gamepad2,
  Trophy,
  Clock,
  RefreshCw,
  Server,
  Shield,
  Swords,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
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
  inGameLobbies: { lobbyId: string; lobbyName: string; creatorId: string; memberCount: number; gameId: string | null; createdAt: string; status: string }[]
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

function shortId(id: string) {
  if (!id) return "—"
  if (id.length <= 8) return id
  return id.slice(0, 6) + "…"
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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Lobby Row ──────────────────────────────────────────────────────

function LobbyRow({ lobby }: { lobby: ActiveLobby }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{lobby.lobbyName}</p>
          <p className="text-xs text-muted-foreground">
            ID: {lobby.lobbyId} &middot; Leader: {shortId(lobby.leaderId)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary" className="text-[10px] tabular-nums">
          {lobby.memberCount} player{lobby.memberCount !== 1 ? "s" : ""}
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
          Waiting
        </Badge>
        <span className="text-[10px] text-muted-foreground w-16 text-right">
          {lobby.createdAt ? timeAgo(lobby.createdAt) : "—"}
        </span>
      </div>
    </div>
  )
}

// ── Game Row ───────────────────────────────────────────────────────

function GameRow({
  game,
  variant,
}: {
  game: ActiveGame | CompletedGame
  variant: "running" | "completed"
}) {
  const isRunning = variant === "running"
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
            isRunning ? "bg-emerald-500/15" : "bg-amber-500/15"
          }`}
        >
          {isRunning ? (
            <Gamepad2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Trophy className="h-4 w-4 text-amber-400" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              Game {shortId(game.gameId)}
            </p>
            {game.serverIP ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                <Wifi className="h-3 w-3" />
                {game.serverIP}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <WifiOff className="h-3 w-3" />
                No server
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Lobby: {game.lobbyId || "—"} &middot;{" "}
            <span className="inline-flex items-center gap-0.5">
              <Shield className="h-3 w-3" /> A:{game.teamA}
            </span>{" "}
            vs{" "}
            <span className="inline-flex items-center gap-0.5">
              <Swords className="h-3 w-3" /> B:{game.teamB}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {game.realPlayerCount} real
          {game.botCount > 0 ? ` + ${game.botCount} bot` : ""}
        </Badge>
        <Badge
          className={`text-[10px] ${
            isRunning
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}
        >
          {isRunning ? "Running" : "Completed"}
        </Badge>
        {"createdAt" in game && game.createdAt && (
          <span className="text-[10px] text-muted-foreground w-16 text-right">
            {timeAgo(game.createdAt)}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Gamepad2 className="h-10 w-10 mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
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

    // Auto-refresh every 30 seconds
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Game Sessions</h2>
          <Badge variant="outline" className="text-[10px]">
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
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Clock}
          label="Active Lobbies"
          value={summary.activeLobbies}
          accent="bg-blue-500"
        />
        <StatCard
          icon={Gamepad2}
          label="Running Games"
          value={summary.runningGames}
          accent="bg-emerald-500"
        />
        <StatCard
          icon={Trophy}
          label="Completed"
          value={summary.completedGames}
          accent="bg-amber-500"
        />
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
          <TabsTrigger value="lobbies" className="text-xs">
            Lobbies
            {summary.activeLobbies > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
              >
                {summary.activeLobbies}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="running" className="text-xs">
            Running
            {summary.runningGames > 0 && (
              <Badge
                className="ml-1.5 h-4 min-w-4 px-1 text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              >
                {summary.runningGames}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed
            {summary.completedGames > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
              >
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
                <span className="text-muted-foreground font-normal">
                  &mdash; players waiting for a game to start
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeLobbies.length === 0 ? (
                <EmptyState message="No active lobbies right now" />
              ) : (
                activeLobbies.map((lobby) => (
                  <LobbyRow key={lobby.lobbyId} lobby={lobby} />
                ))
              )}
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
                <span className="text-muted-foreground font-normal">
                  &mdash; games currently in progress
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeGames.length === 0 ? (
                <EmptyState message="No games running right now" />
              ) : (
                activeGames.map((game) => (
                  <GameRow
                    key={game.gameId}
                    game={game}
                    variant="running"
                  />
                ))
              )}
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
                <span className="text-muted-foreground font-normal">
                  &mdash; recent finished games
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedGames.length === 0 ? (
                <EmptyState message="No completed games yet" />
              ) : (
                completedGames.map((game) => (
                  <GameRow
                    key={game.gameId}
                    game={game}
                    variant="completed"
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
