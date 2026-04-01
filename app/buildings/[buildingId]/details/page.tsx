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
import { BuildingDetails } from "../../components/building-details";

const BuildingDetailsPage = () => {
  const params = useParams<{ buildingId: string }>();
  const router = useRouter();
  const [building, setBuilding] = useState<any>(null);
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
          `${getApiBaseUrl()}/entity/building/?id=${params.buildingId}`
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setBuilding(json?.data ?? json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch building";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.buildingId, router]);

  if (isLoading) return <div className="p-8">Loading building...</div>;
  if (error || !building) return <div className="p-8 text-red-500">Error: {error || "Building not found"}</div>;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Link href="/buildings">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <Heading
              title={building.name}
              description="Detailed building information"
            />
          </div>
          <Link href={`/buildings/${params.buildingId}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Building
            </Button>
          </Link>
        </div>
        <Separator />
        <BuildingDetails building={building} />
      </div>
    </div>
  );
};

export default BuildingDetailsPage;
