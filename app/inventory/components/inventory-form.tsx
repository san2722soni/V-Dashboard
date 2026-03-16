"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Trash, ArrowLeft } from "lucide-react"
import Link from "next/link"
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
import { Checkbox } from "@/components/ui/checkbox"
import { AlertModal } from "@/components/ui/modals/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InventoryItem, AbilityData, AbilityItem } from "@/lib/Types"

const abilityKeySchema = z.object({
  value: z.coerce.number().default(0),
  description: z.string().default(""),
})

const abilityDataSchema = z.object({
  Key1: abilityKeySchema.default({ value: 0, description: "" }),
  Key2: abilityKeySchema.default({ value: 0, description: "" }),
  Key3: abilityKeySchema.default({ value: 0, description: "" }),
  Key4: abilityKeySchema.default({ value: 0, description: "" }),
})

const abilityItemZodSchema = z.object({
  abilityName: z.string().min(1),
  abilityData: abilityDataSchema,
})

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  attack: z.coerce.number().optional(),
  health: z.coerce.number().optional(),
  range: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  round: z.coerce.number().optional(),
  storageCost: z.coerce.number().optional(),
  purchaseCost: z.coerce.number().optional(),
  abilities: z.array(abilityItemZodSchema).default([]),
  isActive: z.boolean(),
})

type InventoryFormValues = z.infer<typeof formSchema>

interface InventoryFormProps {
  initialData?: InventoryItem | null
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ initialData }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // State for managing abilities
  const [abilityName, setAbilityName] = useState("")
  const defaultAbilityData: AbilityData = {
    Key1: { value: 0, description: "" },
    Key2: { value: 0, description: "" },
    Key3: { value: 0, description: "" },
    Key4: { value: 0, description: "" },
  }
  const [newAbilityData, setNewAbilityData] = useState<AbilityData>({ ...defaultAbilityData })

  const title = initialData ? "Edit Item" : "Create Item"
  const description = initialData ? "Edit inventory item properties." : "Add a new inventory item."
  const toastMessage = initialData ? "Item updated." : "Item created."
  const action = initialData ? "Save Changes" : "Create"

  const convertAbilities = (abilities: any): AbilityItem[] => {
    if (!abilities || !Array.isArray(abilities)) return []
    return abilities.map((item: any) => {
      const d = item.abilityData || {}
      return {
        abilityName: item.abilityName || "",
        abilityData: {
          Key1: { value: Number(d.Key1?.value) || 0, description: d.Key1?.description || "" },
          Key2: { value: Number(d.Key2?.value) || 0, description: d.Key2?.description || "" },
          Key3: { value: Number(d.Key3?.value) || 0, description: d.Key3?.description || "" },
          Key4: { value: Number(d.Key4?.value) || 0, description: d.Key4?.description || "" },
        },
      }
    })
  }

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          attack: initialData.attack || 0,
          health: initialData.health || 0,
          range: initialData.range || 0,
          duration: initialData.duration || 0,
          round: initialData.round || 0,
          storageCost: initialData.storageCost || 0,
          purchaseCost: initialData.purchaseCost || 0,
          abilities: convertAbilities(initialData.abilities),
          isActive: initialData.isActive ?? true,
        }
      : {
          name: "",
          attack: 0,
          health: 0,
          range: 0,
          duration: 0,
          round: 0,
          storageCost: 0,
          purchaseCost: 0,
          abilities: [],
          isActive: true,
        },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        attack: initialData.attack || 0,
        health: initialData.health || 0,
        range: initialData.range || 0,
        duration: initialData.duration || 0,
        round: initialData.round || 0,
        storageCost: initialData.storageCost || 0,
        purchaseCost: initialData.purchaseCost || 0,
        abilities: convertAbilities(initialData.abilities),
        isActive: initialData.isActive ?? true,
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        const res = await fetch(
          `${getApiBaseUrl()}/entity/inventory?id=${initialData._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates: data }),
          }
        )
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Update failed")
        }
      } else {
        const res = await fetch(
          `${getApiBaseUrl()}/entity/inventory`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        )
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || "Create failed")
        }
      }

      toast.success(toastMessage)
      router.push("/inventory")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${getApiBaseUrl()}/entity/inventory/?id=${initialData?._id}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        toast.success("Item deleted.")
        router.push("/inventory")
        router.refresh()
      } else {
        toast.error("Item not deleted.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const addAbility = () => {
    if (!abilityName.trim()) {
      toast.warning("Please enter an ability name before adding")
      return
    }
    const currentAbilities = form.getValues("abilities")
    if (currentAbilities.some(a => a.abilityName === abilityName)) {
      toast.warning("An ability with this name already exists")
      return
    }
    form.setValue("abilities", [
      ...currentAbilities,
      { abilityName, abilityData: { ...newAbilityData } },
    ])
    setAbilityName("")
    setNewAbilityData({
      Key1: { value: 0, description: "" },
      Key2: { value: 0, description: "" },
      Key3: { value: 0, description: "" },
      Key4: { value: 0, description: "" },
    })
  }

  const removeAbility = (index: number) => {
    const currentAbilities = form.getValues("abilities")
    form.setValue("abilities", currentAbilities.filter((_, i) => i !== index))
  }

  const updateExistingAbilityKey = (index: number, keyName: keyof AbilityData, field: "value" | "description", fieldValue: number | string) => {
    const currentAbilities = [...form.getValues("abilities")]
    currentAbilities[index] = {
      ...currentAbilities[index],
      abilityData: {
        ...currentAbilities[index].abilityData,
        [keyName]: {
          ...currentAbilities[index].abilityData[keyName],
          [field]: fieldValue,
        },
      },
    }
    form.setValue("abilities", currentAbilities)
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <Heading title={title} description={description} />
          {initialData && (
            <Button variant="destructive" size="icon" onClick={() => setOpen(true)} disabled={loading}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Combat Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="attack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attack</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Range</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="round"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ammo (Round)</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Economic Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="storageCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Cost</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Cost</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Abilities Section */}
          <Card>
            <CardHeader>
              <CardTitle>Abilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Ability */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-semibold">Create New Ability</h3>
                <div className="space-y-2">
                  <FormLabel>Ability Name</FormLabel>
                  <Input
                    placeholder="Ability name"
                    value={abilityName}
                    onChange={(e) => setAbilityName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {(["Key1", "Key2", "Key3", "Key4"] as const).map((keyName) => (
                  <div key={keyName} className="space-y-2">
                    <FormLabel>{keyName}</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Description"
                        value={newAbilityData[keyName].description}
                        onChange={(e) => setNewAbilityData({
                          ...newAbilityData,
                          [keyName]: { ...newAbilityData[keyName], description: e.target.value },
                        })}
                        disabled={loading}
                        className="flex-[3]"
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={newAbilityData[keyName].value}
                        onChange={(e) => setNewAbilityData({
                          ...newAbilityData,
                          [keyName]: { ...newAbilityData[keyName], value: Number(e.target.value) },
                        })}
                        disabled={loading}
                        className="flex-[2]"
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" onClick={addAbility} disabled={loading}>
                  Add Ability
                </Button>
              </div>

              {/* Existing Abilities */}
              {form.watch("abilities").length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Existing Abilities</h3>
                  {form.watch("abilities").map((item, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{item.abilityName}</CardTitle>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAbility(index)}
                            disabled={loading}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(["Key1", "Key2", "Key3", "Key4"] as const).map((keyName) => (
                          <div key={keyName} className="flex items-center gap-2 p-2 bg-secondary rounded">
                            <span className="text-sm font-medium w-12">{keyName}</span>
                            <Input
                              placeholder="Description"
                              value={item.abilityData[keyName]?.description || ""}
                              onChange={(e) => updateExistingAbilityKey(index, keyName, "description", e.target.value)}
                              disabled={loading}
                              className="flex-[3]"
                            />
                            <Input
                              type="number"
                              value={item.abilityData[keyName]?.value || 0}
                              onChange={(e) => updateExistingAbilityKey(index, keyName, "value", Number(e.target.value))}
                              disabled={loading}
                              className="flex-[2]"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
