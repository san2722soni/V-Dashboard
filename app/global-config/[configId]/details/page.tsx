"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";
import { authService } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ConfigDetails } from "../../components/config-details";

const ConfigDetailsPage = () => {
  const params = useParams<{ configId: string }>();
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await authService.authenticatedFetch(
          `${getApiBaseUrl()}/entity/global-config/?id=${params.configId}`
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setConfig(json?.data ?? json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch config";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.configId, router]);

  if (isLoading) return <div className="p-8">Loading config...</div>;
  if (error || !config) return <div className="p-8 text-red-500">Error: {error || "Config not found"}</div>;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Link href="/global-config">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <Heading
              title={config.key}
              description="Global config entry details"
            />
          </div>
          <Link href={`/global-config/${params.configId}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Config
            </Button>
          </Link>
        </div>
        <Separator />
        <ConfigDetails config={config} />
      </div>
    </div>
  );
};

export default ConfigDetailsPage;
