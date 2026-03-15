export const dynamic = "force-dynamic";

import { CharacterClient } from "./components/client";

const CharactersPage = async () => {
  let characters: any[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/entity/character`,
      { cache: "no-store" }
    );

    const data = await res.json();

    characters = data.map((item: any) => ({
      id: item._id || "",
      name: item.name,
      level: item.level,
      health: item.health,
      attackDamage: item.attackDamage,
      attackType: item.attackType,
      weight: item.weight,
      isActive: item.isActive,
    }));
  } catch (error) {
    console.error("Failed to fetch characters:", error);
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CharacterClient data={characters} />
      </div>
    </div>
  );
};

export default CharactersPage;
