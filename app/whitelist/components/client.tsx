"use client"

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import Heading from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { columns, type WhitelistedUser } from "./column"
import { AddWhitelistModal } from "./add-whitelist-modal"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getApiBaseUrl } from "@/lib/api-config";

export const WhitelistClient = () => {
  const router = useRouter()

  const [data, setData] = useState<WhitelistedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchWhitelistedUsers = async () => {
    try {
      setLoading(true)
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/whitelistedUser/getAll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data || [])
        } else {
          toast.error(result.message || "Failed to fetch whitelisted users")
        }
      } else {
        toast.error("Failed to fetch whitelisted users")
      }
    } catch (error) {
      console.error("Failed to fetch whitelisted users:", error)
      toast.error("Failed to fetch whitelisted users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser?.role !== "admin") {
      router.push("/")
      return
    }

    fetchWhitelistedUsers()
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this email from the whitelist?")) return

    try {
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/whitelistedUser/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success("Email removed from whitelist")
          fetchWhitelistedUsers()
        } else {
          toast.error(result.message || "Failed to remove email")
        }
      } else {
        toast.error("Failed to remove email")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const columnsWithActions = columns(handleDelete)

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Whitelisted Users (${data.length})`}
          description="Manage whitelisted emails for production access"
        />
        <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          {loading ? "Loading..." : "Add Email"}
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="email"
        columns={columnsWithActions}
        data={data}
      />

      <AddWhitelistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchWhitelistedUsers}
      />
    </>
  )
}
