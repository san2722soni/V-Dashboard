import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { InventoryDetails } from "../../components/inventory-details";

interface InventoryDetailsPageProps {
  params: {
    itemId: string;
  };
}

const InventoryDetailsPage = async ({ params }: InventoryDetailsPageProps) => {
  let item = null;

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/entity/inventory/?id=${params.itemId}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Not found");
    const json = await res.json();
    item = json?.data ?? json;
  } catch (error) {
    notFound();
  }

  if (!item) {
    notFound();
  }

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
