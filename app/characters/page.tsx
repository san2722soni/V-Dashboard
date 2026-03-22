"use client"

import { useEffect, useState } from "react"
import { CharacterClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"
import { authService } from "@/lib/auth"

const CharactersPage = () => {
  const [characters, setCharacters] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await authService.authenticatedFetch(`${getApiBaseUrl()}/entity/character`)

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`)
        }

        const data = await res.json()

        setCharacters(
          data.map((item: any) => ({
            id: item._id || "",
            name: item.name,
            level: item.level,
            health: item.health,
            attackDamage: item.attackDamage,
            attackType: item.attackType,
            weight: item.weight,
            isActive: item.isActive,
          }))
        )
        setError(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch characters"
        console.error(message, error)
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {isLoading && <p>Loading characters...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && <CharacterClient data={characters} />}
      </div>
    </div>
  )
}

export default CharactersPage