"use client";

import { useEffect, useState } from "react";
import { getApiServer, setApiServer, type ApiServer } from "@/lib/api-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeftRight, AlertTriangle } from "lucide-react";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setServer(getApiServer());
  }, []);

  if (!mounted) return null;

  const isProd = server === "prod";
  const targetEnv = isProd ? "DEV" : "PROD";

  const handleConfirm = () => {
    const next: ApiServer = isProd ? "dev" : "prod";
    setApiServer(next);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/sign-in";
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        className="gap-2"
      >
        <ArrowLeftRight className="h-4 w-4" />
        Switch to {targetEnv}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Switch to {targetEnv}?
            </DialogTitle>
            <DialogDescription>
              You will be logged out and redirected to the sign-in page.
              {!isProd && " You are switching to the production environment."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isProd ? "default" : "destructive"}
              onClick={handleConfirm}
            >
              Switch to {targetEnv}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
