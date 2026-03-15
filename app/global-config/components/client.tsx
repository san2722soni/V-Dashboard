"use client"

import type React from "react"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { type GlobalConfigColumn } from "@/lib/Types"
import { columns } from "./columns"

import { Button } from "@/components/ui/button"
import Heading from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { useEffect } from "react"
import { authService } from "@/lib/auth"

interface GlobalConfigClientProps {
  data: GlobalConfigColumn[]
}

export const GlobalConfigClient: React.FC<GlobalConfigClientProps> = ({ data }) => {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()){
      router.push("/sign-in");
    }
  }, [router]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Global Config (${data.length})`} description="Manage global configuration key-value pairs." />
        <Button onClick={() => router.push("/global-config/new")}>
          <Plus className="mr-2 h-4 w-4 text-white" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="key" columns={columns} data={data} />
      <Heading title="API" description="API calls for Global Config" />
      <Separator />
      <ApiList entityName="global-config" entityIdName="configId" router="/entity"/>
    </>
  )
}
