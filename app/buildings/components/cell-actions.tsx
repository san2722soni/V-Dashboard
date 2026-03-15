"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertModal } from "@/components/ui/modals/alert-modal"
import type { BuildingColumn } from "@/lib/Types";

interface CellActionProps {
  data: BuildingColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Building ID copied to the clipboard.")
  }

  const onDelete = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entity/building/?id=${data.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await res.json();
        toast.success("Building deleted.");
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Delete failed:", errorData);
        toast.error("Building not deleted.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4 text-blue-500" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/buildings/${data.id}/details`)}>
            <Eye className="mr-2 h-4 w-4 text-primary" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/buildings/${data.id}`)}>
            <Edit className="mr-2 h-4 w-4 text-amber-500" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4 text-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
