import { BuildingForm } from "../components/building-form";
import { getApiBaseUrl } from "@/lib/api-config";

interface BuildingPageProps {
  params: {
    buildingId: string;
  };
}

const BuildingPage = async ({ params }: BuildingPageProps) => {
  let building = null;

  if (params.buildingId !== "new") {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/entity/building/?id=${params.buildingId}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Not found");
      }
      const json = await res.json();
      building = json?.data ?? json;
    } catch (error) {
      // Error handling - form will show create mode if fetch fails
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BuildingForm initialData={building} />
      </div>
    </div>
  );
};

export default BuildingPage;
