"use client"

import type React from "react"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { type BuildingColumn } from "@/lib/Types"
import { columns } from "./columns"

import { Button } from "@/components/ui/button"
import Heading from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { useEffect } from "react"
import { authService } from "@/lib/auth"

interface BuildingClientProps {
  data: BuildingColumn[]
}

export const BuildingClient: React.FC<BuildingClientProps> = ({ data }) => {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()){
      router.push("/sign-in");
    }
  }, [router]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Buildings (${data.length})`} description="Manage buildings for your game." />
        <Button onClick={() => router.push("/buildings/new")}>
          <Plus className="mr-2 h-4 w-4 text-white" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API calls for Buildings" />
      <Separator />
      <ApiList entityName="building" entityIdName="buildingId" router="/entity"/>
    </>
  )
}
