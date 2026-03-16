import { ConfigForm } from "../components/config-form";
import { getApiBaseUrl } from "@/lib/api-config";

interface ConfigPageProps {
  params: {
    configId: string;
  };
}

const ConfigEditPage = async ({ params }: ConfigPageProps) => {
  let config = null;

  if (params.configId !== "new") {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/entity/global-config/?id=${params.configId}`
      );
      if (!res.ok) {
        throw new Error("Not found");
      }
      const json = await res.json();
      config = json?.data ?? json;
    } catch (error) {
      console.error("Failed to fetch config entry:", error);
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ConfigForm initialData={config} />
      </div>
    </div>
  );
};

export default ConfigEditPage;
