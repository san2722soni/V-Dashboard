"use client"

import { useEffect, useState } from "react"
import { BuildingClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/entity/building`)
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
      } catch (error) {
        console.error("Failed to fetch buildings:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BuildingClient data={buildings} />
      </div>
    </div>
  )
}

export default BuildingsPage