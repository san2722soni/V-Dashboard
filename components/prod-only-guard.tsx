"use client";

import { useEffect, useState } from "react";
import { getApiServer } from "@/lib/api-config";
import { Lock } from "lucide-react";

export const ProdOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(getApiServer() === "dev");

    const handleChange = () => setIsDev(getApiServer() === "dev");
    window.addEventListener("apiServerChanged", handleChange);
    return () => window.removeEventListener("apiServerChanged", handleChange);
  }, []);

  return (
    <div className="relative min-h-[60vh]">
      {isDev && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-40 bg-background/80 backdrop-blur-[2px] rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-lg font-medium text-muted-foreground/60">
              Accessible only in production
            </p>
          </div>
        </div>
      )}
      <div className={isDev ? "pointer-events-none select-none opacity-40" : ""}>
        {children}
      </div>
    </div>
  );
};
