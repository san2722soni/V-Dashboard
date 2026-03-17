"use client"

import { useEffect, useState } from "react"
import { InventoryClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"

const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/entity/inventory`)
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
      } catch (error) {
        console.error("Failed to fetch inventory:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InventoryClient data={items} />
      </div>
    </div>
  )
}

export default InventoryPage