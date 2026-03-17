"use client"

import { useEffect, useState } from "react"
import { CharacterClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"

const CharactersPage = () => {
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/entity/character`)
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
      } catch (error) {
        console.error("Failed to fetch characters:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CharacterClient data={characters} />
      </div>
    </div>
  )
}

export default CharactersPage