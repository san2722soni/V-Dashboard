export const dynamic = "force-dynamic";

import { InventoryClient } from "./components/client";
import { getApiBaseUrl } from "@/lib/api-config";

const InventoryPage = async () => {
  let items: any[] = [];

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/entity/inventory`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const list = Array.isArray(data) ? data : data.inventory;

    items = list.map((item: any) => ({
      id: item._id || "",
      name: item.name,
      attack: item.attack,
      health: item.health,
      range: item.range,
      duration: item.duration,
      round: item.round,
      storageCost: item.storageCost,
      purchaseCost: item.purchaseCost,
      isActive: item.isActive,
    }));
  } catch (error) {
    // Error handling
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InventoryClient data={items} />
      </div>
    </div>
  );
};

export default InventoryPage;
