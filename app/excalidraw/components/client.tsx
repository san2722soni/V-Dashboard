"use client"

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import Heading from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { columns, type ExcalidrawBoard } from "./columns"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const ExcalidrawListClient = () => {
  const router = useRouter()

  const [data, setData] = useState<ExcalidrawBoard[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBoards = async () => {
    try {
      setLoading(true)
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/excalidraw/getBoards`,
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
          toast.error(result.message || "Failed to fetch boards")
        }
      } else {
        toast.error("Failed to fetch boards")
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error)
      toast.error("Failed to fetch boards")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/sign-in")
      return
    }
    fetchBoards()
  }, [router])

  const handleEdit = (id: string) => {
    router.push(`/excalidraw/${id}`)
  }

  const handleClone = async (id: string) => {
    try {
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/excalidraw/cloneBoard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId: id }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success("Board cloned successfully")
          fetchBoards()
        } else {
          toast.error(result.message || "Failed to clone board")
        }
      } else {
        toast.error("Failed to clone board")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this board?")) return

    try {
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/excalidraw/deleteBoard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId: id }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success("Board deleted successfully")
          fetchBoards()
        } else {
          toast.error(result.message || "Failed to delete board")
        }
      } else {
        toast.error("Failed to delete board")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const columnsWithActions = columns(handleEdit, handleClone, handleDelete)

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Excalidraw Boards (${data.length})`}
          description="Create and manage whiteboard diagrams"
        />
        <Button onClick={() => router.push("/excalidraw/new")} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          {loading ? "Loading..." : "New Board"}
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" columns={columnsWithActions} data={data} />
    </>
  )
}
