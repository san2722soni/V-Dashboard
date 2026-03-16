import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ConfigDetails } from "../../components/config-details";

interface ConfigDetailsPageProps {
  params: {
    configId: string;
  };
}

const ConfigDetailsPage = async ({ params }: ConfigDetailsPageProps) => {
  let config = null;

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/entity/global-config/?id=${params.configId}`
    );
    if (!res.ok) throw new Error("Not found");
    const json = await res.json();
    config = json?.data ?? json;
  } catch (error) {
    console.error("Failed to fetch config entry:", error);
    notFound();
  }

  if (!config) {
    notFound();
  }

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
