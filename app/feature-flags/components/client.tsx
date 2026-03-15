"use client"

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import Heading from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { columns, type FeatureFlag } from "./column"
import { FeatureFlagModal } from "./featureFlag-modal"
import { NewFeatureFlag } from "./new-featureFlag"
import { UpdateFeatureFlag } from "./update-feature-flag"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { ApiList } from "@/components/ui/api-list"
import { toast } from "sonner"

export const FeatureFlagClient = () => {
  const router = useRouter()

  const [data, setData] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedFeatureFlag, setFeatureFlagSelected] = useState<FeatureFlag | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true)
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/featureFlag/getFeatureFlags`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
      )
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch feature flags:", error)
      toast.error("Failed to fetch feature flags")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this feature flag?")) {
      return
    }

    try {
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/featureFlag/deleteFeatureFlag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        },
      )

      if (response.ok) {
        toast.success("Feature flag deleted successfully")
        fetchFeatureFlags()
      } else {
        toast.error("Failed to delete feature flag")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleViewDetails = (featureFlag: FeatureFlag) => {
    setFeatureFlagSelected(featureFlag)
    setIsDetailModalOpen(true)
  }

  const handleEdit = (featureFlag: FeatureFlag) => {
    setFeatureFlagSelected(featureFlag)
    setIsUpdateModalOpen(true)
  }

  const columnsWithActions = columns(handleViewDetails, handleEdit, handleDelete)

  useEffect(() => {
    if (!authService.isAuthenticated()){
      router.push("/sign-in");
    }

    fetchFeatureFlags()
  }, [router])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Feature Flags (${data.length})`} description="Manage Feature Flags" />
        <Button onClick={() => setIsNewModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columnsWithActions} data={data} />

      <NewFeatureFlag isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={fetchFeatureFlags} />

      <UpdateFeatureFlag
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={fetchFeatureFlags}
        featureFlag={selectedFeatureFlag}
      />

      <FeatureFlagModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        featureFlag={selectedFeatureFlag}
      />
      <ApiList entityName="featureFlag" entityIdName="featureFlagId" router="/dashboard" />
    </>
  )
}
