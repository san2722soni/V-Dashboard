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
import { InventoryDetails } from "../../components/inventory-details";

const InventoryDetailsPage = () => {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
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
          `${getApiBaseUrl()}/entity/inventory/?id=${params.itemId}`
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setItem(json?.data ?? json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch item";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.itemId, router]);

  if (isLoading) return <div className="p-8">Loading item...</div>;
  if (error || !item) return <div className="p-8 text-red-500">Error: {error || "Item not found"}</div>;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <Heading
              title={item.name}
              description="Detailed inventory item information"
            />
          </div>
          <Link href={`/inventory/${params.itemId}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Item
            </Button>
          </Link>
        </div>
        <Separator />
        <InventoryDetails item={item} />
      </div>
    </div>
  );
};

export default InventoryDetailsPage;
