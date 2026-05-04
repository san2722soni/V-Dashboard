// Anarchy api client. Anarchy lives at a separate origin
// (https://anarchy.olivs.in/api) with its own JWT auth — distinct from
// v-dashboard's authService. We store the anarchy access token in
// localStorage under a dedicated key so the two auth systems don't
// clash.

const ANARCHY_BASE = process.env.NEXT_PUBLIC_ANARCHY_API_URL
  || "https://anarchy.olivs.in/api";

const TOKEN_KEY = "anarchyDevToken";
const EMAIL_KEY = "anarchyDevEmail";

// ---------- token storage ----------
export const getAnarchyToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getAnarchyEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
};

export const clearAnarchyAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
};

// ---------- login ----------
// Anarchy api returns { accessToken, refreshToken, player } on success.
// We only persist accessToken — refresh isn't needed for short
// dashboard sessions.
export const anarchyLogin = async (email: string, password: string) => {
  const r = await fetch(`${ANARCHY_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.message || "login failed");
  localStorage.setItem(TOKEN_KEY, j.accessToken);
  localStorage.setItem(EMAIL_KEY, j.player?.email || email);
  return j;
};

// ---------- authed fetch helper ----------
// Only sets Content-Type when there's actually a body — fastify
// otherwise 400s on POST/DELETE with `application/json` + empty body.
const authedFetch = async (path: string, init: RequestInit = {}) => {
  const token = getAnarchyToken();
  if (!token) throw new Error("not logged in to Anarchy");
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
    "Authorization": `Bearer ${token}`,
  };
  if (init.body) headers["Content-Type"] = "application/json";
  const r = await fetch(`${ANARCHY_BASE}${path}`, { ...init, headers });
  const text = await r.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!r.ok) throw new Error(json.message || `HTTP ${r.status}`);
  return json;
};

// ---------- bot-fleet endpoints ----------
export type BotRun = {
  runId:       string;
  count?:      number;
  instanceIds: string[];
  expiresAt?:  string;
  state?:      string;
};

export type BotRunDetail = {
  runId:    string;
  instances: {
    id:       string;
    state:    string;
    publicIp: string | null;
    launched: string;
  }[];
};

export const spawnBots = (n: number) =>
  authedFetch(`/dev/bot/spawn/${n}`, { method: "POST" });

export const listBotRuns = (): Promise<BotRun[]> =>
  authedFetch("/dev/bot/runs");

export const describeBotRun = (runId: string): Promise<BotRunDetail> =>
  authedFetch(`/dev/bot/runs/${encodeURIComponent(runId)}`);

export const terminateBotRun = (runId: string) =>
  authedFetch(`/dev/bot/runs/${encodeURIComponent(runId)}`, { method: "DELETE" });

export const terminateAllBots = () =>
  authedFetch("/dev/bot", { method: "DELETE" });