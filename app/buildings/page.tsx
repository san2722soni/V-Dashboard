"use client"

import { useEffect, useState } from "react"
import { BuildingClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"
import { authService } from "@/lib/auth"

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await authService.authenticatedFetch(`${getApiBaseUrl()}/entity/building`)

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`)
        }

        const data = await res.json()

        setBuildings(
          data.map((item: any) => ({
            id: item._id || "",
            name: item.name,
            health: item.health,
            attack: item.attack,
            storage: item.storage,
            level: item.level,
            isActive: item.isActive,
          }))
        )
        setError(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch buildings"
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
        {isLoading && <p>Loading buildings...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && <BuildingClient data={buildings} />}
      </div>
    </div>
  )
}

export default BuildingsPage