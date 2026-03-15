export const dynamic = "force-dynamic";

import { BuildingClient } from "./components/client";

const BuildingsPage = async () => {
  let buildings: any[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/entity/building`,
      { cache: "no-store" }
    );

    const data = await res.json();

    buildings = data.map((item: any) => ({
      id: item._id || "",
      name: item.name,
      health: item.health,
      attack: item.attack,
      storage: item.storage,
      level: item.level,
      isActive: item.isActive,
    }));
  } catch (error) {
    console.error("Failed to fetch buildings:", error);
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BuildingClient data={buildings} />
      </div>
    </div>
  );
};

export default BuildingsPage;
