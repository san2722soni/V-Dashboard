const DEV_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const PROD_URL = process.env.NEXT_PUBLIC_API_PROD_URL || "";

export type ApiServer = "dev" | "prod";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const server = localStorage.getItem("apiServer") as ApiServer | null;
    if (server === "prod") return PROD_URL;
  }
  return DEV_URL;
}

export function getApiServer(): ApiServer {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("apiServer") as ApiServer) || "dev";
  }
  return "dev";
}

export function setApiServer(server: ApiServer) {
  localStorage.setItem("apiServer", server);
  window.dispatchEvent(new Event("apiServerChanged"));
}