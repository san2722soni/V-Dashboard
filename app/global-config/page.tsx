"use client"

import { useEffect, useState } from "react"
import { GlobalConfigClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"
import { authService } from "@/lib/auth"

const GlobalConfigPage = () => {
  const [configs, setConfigs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await authService.authenticatedFetch(`${getApiBaseUrl()}/entity/global-config`)

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`)
        }

        const data = await res.json()
        const list = Array.isArray(data) ? data : data.configs

        setConfigs(
          list.map((item: any) => ({
            id: item._id || "",
            key: item.key,
            value: item.value,
            valueType: item.valueType,
          }))
        )
        setError(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch global config"
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
        {isLoading && <p>Loading global config...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && <GlobalConfigClient data={configs} />}
      </div>
    </div>
  )
}

export default GlobalConfigPage