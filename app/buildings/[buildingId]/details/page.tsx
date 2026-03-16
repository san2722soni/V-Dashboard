import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BuildingDetails } from "../../components/building-details";

interface BuildingDetailsPageProps {
  params: {
    buildingId: string;
  };
}

const BuildingDetailsPage = async ({ params }: BuildingDetailsPageProps) => {
  let building = null;

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/entity/building/?id=${params.buildingId}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Not found");
    const json = await res.json();
    building = json?.data ?? json;
  } catch (error) {
    notFound();
  }

  if (!building) {
    notFound();
  }

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
