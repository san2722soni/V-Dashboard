"use client"

import { useEffect, useState } from "react"
import { GlobalConfigClient } from "./components/client"
import { getApiBaseUrl } from "@/lib/api-config"

const GlobalConfigPage = () => {
  const [configs, setConfigs] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/entity/global-config`)
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
      } catch (error) {
        console.error("Failed to fetch global config:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <GlobalConfigClient data={configs} />
      </div>
    </div>
  )
}

export default GlobalConfigPage