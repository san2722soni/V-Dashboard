import { CharacterForm } from "../components/character-form";
import { getApiBaseUrl } from "@/lib/api-config";

interface CharacterPageProps {
  params: {
    characterId: string;
  };
}

const CharacterPage = async ({ params }: CharacterPageProps) => {
  let character = null;

  if (params.characterId !== "new") {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/entity/character/?id=${params.characterId}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Not found");
      }
      const json = await res.json();
      character = json?.data ?? json;
    } catch (error) {
      // Error handling - form will show create mode if fetch fails
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CharacterForm initialData={character} />
      </div>
    </div>
  );
};

export default CharacterPage;
