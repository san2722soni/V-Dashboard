import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CharacterDetails } from "../../components/character-details";

interface CharacterDetailsPageProps {
  params: {
    characterId: string;
  };
}

const CharacterDetailsPage = async ({ params }: CharacterDetailsPageProps) => {
  let character = null;

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/entity/character/?id=${params.characterId}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Not found");
    const json = await res.json();
    character = json?.data ?? json;
  } catch (error) {
    notFound();
  }

  if (!character) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Link href="/characters">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <Heading
              title={`${character.name}`}
              description="Detailed character information"
            />
          </div>
          <Link href={`/characters/${params.characterId}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Character
            </Button>
          </Link>
        </div>
        <Separator />
        <CharacterDetails character={character} />
      </div>
    </div>
  );
};

export default CharacterDetailsPage;
