"use client";

import { useEffect, useState } from "react";
import { getApiServer, setApiServer, type ApiServer } from "@/lib/api-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

/** Display-only badge for navbar */
export function ServerBadge() {
  const [server, setServer] = useState<ApiServer>("dev");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setServer(getApiServer());
  }, []);

  if (!mounted) return null;

  const isProd = server === "prod";

  return (
    <Badge
      variant={isProd ? "destructive" : "secondary"}
      className="text-[10px] px-2 py-0.5"
    >
      {isProd ? "PROD" : "DEV"}
    </Badge>
  );
}

/** Clickable button to switch servers */
export function ServerSwitchButton() {
  const [server, setServer] = useState<ApiServer>("dev");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setServer(getApiServer());
  }, []);

  if (!mounted) return null;

  const isProd = server === "prod";

  const handleSwitch = () => {
    const next: ApiServer = isProd ? "dev" : "prod";
    setApiServer(next);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/sign-in";
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSwitch}
      className="gap-2"
    >
      <ArrowLeftRight className="h-4 w-4" />
      Switch to {isProd ? "DEV" : "PROD"}
    </Button>
  );
}
