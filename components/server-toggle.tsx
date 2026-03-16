"use client";

import { useEffect, useState } from "react";
import { getApiServer, setApiServer, type ApiServer } from "@/lib/api-config";
import { Badge } from "@/components/ui/badge";

export function ServerToggle() {
  const [server, setServer] = useState<ApiServer>("dev");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setServer(getApiServer());
  }, []);

  if (!mounted) return null;

  const isProd = server === "prod";

  const handleClick = () => {
    const next: ApiServer = isProd ? "dev" : "prod";
    setApiServer(next);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/sign-in";
  };

  return (
    <Badge
      variant={isProd ? "destructive" : "secondary"}
      className="cursor-pointer select-none text-[10px] px-2 py-0.5"
      onClick={handleClick}
    >
      {isProd ? "PROD" : "DEV"}
    </Badge>
  );
}
