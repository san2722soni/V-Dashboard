"use client";

import { useEffect, useState } from "react";
import {
  Bot, Trash2, Plus, RefreshCw, ExternalLink, Activity, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import { DataTable } from "@/components/ui/data-table";

import {
  anarchyLogin,
  clearAnarchyAuth,
  getAnarchyToken,
  spawnBots,
  listBotRuns,
  terminateBotRun,
  terminateAllBots,
  type BotRun,
} from "@/lib/anarchy-api";

import { columns } from "./columns";
import { RunDetailsModal } from "./run-details-modal";

const POLL_MS = 5000;

// Hardcoded dev creds — same pattern as anarchy.olivs.in's sign-in page,
// which exposes "Sign in as Aswin / Sign in as Oliv" buttons with the
// same shared password. The api allowlist (server/util/devAccounts.js)
// gates real privilege.
const DEV_PASSWORD = "1247";

// Account used for the silent auto-login. Anarchy api gates dev
// endpoints by email allowlist — `aswin@gmail.com` is on it.
const DEV_EMAIL = "aswin@gmail.com";

export const AnarchyClient = () => {
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [count, setCount] = useState<number>(1);

  const [detailRunId, setDetailRunId] = useState<string | null>(null);

  // Auto-login on mount if no token. Anarchy is an internal dev tool —
  // the dashboard user has already authed into v-dashboard, so we just
  // mint an anarchy token transparently with the shared dev creds.
  useEffect(() => {
    let alive = true;
    (async () => {
      const existing = getAnarchyToken();
      if (existing) { setToken(existing); return; }
      try {
        await anarchyLogin(DEV_EMAIL, DEV_PASSWORD);
        if (!alive) return;
        setToken(getAnarchyToken());
      } catch (e) {
        if (alive) setAuthError((e as Error).message);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Poll active runs every 5s while authed. 401 → token expired → re-auth.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    const fetchRuns = async () => {
      try {
        const r = await listBotRuns();
        if (alive) setRuns(r);
      } catch (e) {
        if ((e as Error).message?.includes("401")) {
          clearAnarchyAuth();
          if (alive) setToken(null);   // triggers the auto-login effect again
        }
      }
    };
    fetchRuns();
    const id = setInterval(fetchRuns, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [token]);

  const handleSpawn = async () => {
    if (!Number.isFinite(count) || count < 1 || count > 100) {
      toast.error("count must be 1-100");
      return;
    }
    setBusy("spawn");
    try {
      const r = await spawnBots(count);
      toast.success(`spawned ${r.count} bot(s) — run ${r.runId}`);
      setRuns((prev) => [
        {
          runId:       r.runId,
          count:       r.count,
          instanceIds: r.instanceIds || [],
          expiresAt:   r.expiresAt,
        },
        ...prev,
      ]);
    } catch (e) {
      toast.error(`spawn failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const handleTerminate = async (runId: string) => {
    setBusy(`term:${runId}`);
    try {
      await terminateBotRun(runId);
      toast.success(`terminated ${runId}`);
      setRuns((prev) => prev.filter((r) => r.runId !== runId));
    } catch (e) {
      toast.error(`terminate failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const handleKillAll = async () => {
    if (!confirm(`Terminate ALL ${runs.length} active runs?`)) return;
    setBusy("killAll");
    try {
      const r = await terminateAllBots();
      toast.success(`killed ${r.totalAcked ?? 0} instance(s)`);
      setRuns([]);
    } catch (e) {
      toast.error(`kill-all failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  // ---------- auth in flight (auto-login from useEffect above) ----------
  if (!token) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardHeader>
          <CardTitle>Anarchy Bot Fleet</CardTitle>
          <CardDescription>
            {authError
              ? `Could not auth to anarchy api: ${authError}`
              : "Authenticating with anarchy api…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          {authError ? (
            <Button onClick={() => { setAuthError(null); setToken(null); }}>
              Retry
            </Button>
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    );
  }

  // ---------- authed: full management UI ----------
  const totalBots = runs.reduce((acc, r) => acc + (r.instanceIds?.length ?? 0), 0);

  // Wrap columns to hook the details + terminate handlers in.
  const cols = columns(handleTerminate, (runId) => setDetailRunId(runId));

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Anarchy Bot Fleet`}
          description={`Polling every 5s — ${runs.length} active run${runs.length === 1 ? "" : "s"}`}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => listBotRuns().then(setRuns).catch(() => {})}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>
      <Separator />

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">Active runs</p>
            <p className="text-3xl font-bold">{runs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">Active bots</p>
            <p className="text-3xl font-bold">{totalBots}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">Status</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-500" />
              <span className="text-base font-medium text-green-500">Live</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spawn + kill row */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="count">Bots to spawn</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="w-32"
            />
          </div>
          <Button onClick={handleSpawn} disabled={busy === "spawn"}>
            <Plus className="mr-2 h-4 w-4" />
            <Bot className="mr-2 h-4 w-4" />
            {busy === "spawn" ? "Spawning…" : `Spawn ${count} bot${count === 1 ? "" : "s"}`}
          </Button>
          <div className="ml-auto">
            <Button
              variant="destructive"
              onClick={handleKillAll}
              disabled={busy === "killAll" || runs.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {busy === "killAll" ? "Killing…" : "Kill all bots"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active runs table */}
      <DataTable
        searchKey="runId"
        columns={cols}
        data={runs}
      />

      {/* Footer: Kibana deep-link */}
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Bot logs</p>
            <p className="text-xs text-muted-foreground">
              Filebeat ships every bot&apos;s <code>/var/log/loadtest/bot-*.log</code> to ES under <code>botLogs-*</code>.
              Filter in Kibana with <code>project: anarchy-loadtest</code>.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a
              href="https://kibana.olivs.in/app/discover#/?_a=(index:'botLogs-*')"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Open Kibana
            </a>
          </Button>
        </CardContent>
      </Card>

      <RunDetailsModal
        runId={detailRunId}
        isOpen={detailRunId !== null}
        onClose={() => setDetailRunId(null)}
      />
    </>
  );
};