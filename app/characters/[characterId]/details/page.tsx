"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";
import { authService } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CharacterDetails } from "../../components/character-details";

const CharacterDetailsPage = () => {
  const params = useParams<{ characterId: string }>();
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await authService.authenticatedFetch(
          `${getApiBaseUrl()}/entity/character/?id=${params.characterId}`
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setCharacter(json?.data ?? json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch character";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.characterId, router]);

  if (isLoading) return <div className="p-8">Loading character...</div>;
  if (error || !character) return <div className="p-8 text-red-500">Error: {error || "Character not found"}</div>;

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
