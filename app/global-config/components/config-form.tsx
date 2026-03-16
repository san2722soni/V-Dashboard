"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Trash } from "lucide-react"
import { getApiBaseUrl } from "@/lib/api-config";

import { Button } from "@/components/ui/button"
import Heading from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertModal } from "@/components/ui/modals/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GlobalConfigEntry } from "@/lib/Types"

const formSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  valueType: z.enum(["string", "number", "boolean"]),
})

type ConfigFormValues = z.infer<typeof formSchema>

interface ConfigFormProps {
  initialData?: GlobalConfigEntry | null
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ initialData }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? "Edit Config" : "Create Config"
  const description = initialData ? "Edit global config entry." : "Add a new global config entry."
  const toastMessage = initialData ? "Config updated." : "Config created."
  const action = initialData ? "Save Changes" : "Create"

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          key: initialData.key || "",
          value: String(initialData.value ?? ""),
          valueType: initialData.valueType || "string",
        }
      : {
          key: "",
          value: "",
          valueType: "string",
        },
  })

  const currentValueType = form.watch("valueType")

  const onSubmit = async (data: ConfigFormValues) => {
    try {
      setLoading(true)

      let castValue: string | number | boolean = data.value
      if (data.valueType === "number") {
        castValue = Number(data.value)
      } else if (data.valueType === "boolean") {
        castValue = data.value === "true"
      }

      const payload = {
        key: data.key,
        value: castValue,
        valueType: data.valueType,
      }

      if (initialData) {
        const res = await fetch(
          `${getApiBaseUrl()}/entity/global-config?id=${initialData._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates: payload }),
          }
        )
        if (!res.ok) throw new Error("Update failed")
      } else {
        const res = await fetch(
          `${getApiBaseUrl()}/entity/global-config`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        )
        if (!res.ok) throw new Error("Create failed")
      }

      toast.success(toastMessage)
      router.push("/global-config")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${getApiBaseUrl()}/entity/global-config/?id=${initialData?._id}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        toast.success("Config entry deleted.")
        router.push("/global-config")
        router.refresh()
      } else {
        toast.error("Config entry not deleted.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button variant="destructive" size="icon" onClick={() => setOpen(true)} disabled={loading}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Config Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input disabled={loading || !!initialData} placeholder="Config key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Type</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      {currentValueType === "boolean" ? (
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <Checkbox
                            checked={field.value === "true"}
                            onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                          />
                          <div className="space-y-1 leading-none">
                            <FormLabel>{field.value === "true" ? "True" : "False"}</FormLabel>
                          </div>
                        </div>
                      ) : (
                        <Input
                          type={currentValueType === "number" ? "number" : "text"}
                          disabled={loading}
                          placeholder="Config value"
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
