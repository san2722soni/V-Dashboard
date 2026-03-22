"use client"

import { useEffect, useState } from "react"
import { InventoryClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"
import { authService } from "@/lib/auth"

const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await authService.authenticatedFetch(`${getApiBaseUrl()}/entity/inventory`)

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`)
        }

        const data = await res.json()
        const list = Array.isArray(data) ? data : data.inventory

        setItems(
          list.map((item: any) => ({
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
          }))
        )
        setError(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch inventory"
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
        {isLoading && <p>Loading inventory...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && <InventoryClient data={items} />}
      </div>
    </div>
  )
}

export default InventoryPage