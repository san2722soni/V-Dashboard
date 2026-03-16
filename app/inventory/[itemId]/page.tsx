import { InventoryForm } from "../components/inventory-form";
import { getApiBaseUrl } from "@/lib/api-config";

interface InventoryPageProps {
  params: {
    itemId: string;
  };
}

const InventoryEditPage = async ({ params }: InventoryPageProps) => {
  let item = null;

  if (params.itemId !== "new") {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/entity/inventory/?id=${params.itemId}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Not found");
      }
      const json = await res.json();
      item = json?.data ?? json;
    } catch (error) {
      // Error handling - form will show create mode if fetch fails
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InventoryForm initialData={item} />
      </div>
    </div>
  );
};

export default InventoryEditPage;
