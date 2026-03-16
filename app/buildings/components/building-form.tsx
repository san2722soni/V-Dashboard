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
import type { Building, AbilityData, AbilityItem } from "@/lib/Types"

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

const abilityItemSchema = z.object({
  abilityName: z.string().min(1),
  abilityData: abilityDataSchema,
})

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  health: z.coerce.number().min(0),
  attack: z.coerce.number().optional(),
  storage: z.coerce.number().min(0),
  level: z.coerce.number().optional(),
  bulletSpeed: z.coerce.number().min(0).default(0),
  fireRate: z.coerce.number().min(0).default(0),
  abilities: z.array(abilityItemSchema).default([]),
  isActive: z.boolean(),
})

type BuildingFormValues = z.infer<typeof formSchema>

interface BuildingFormProps {
  initialData?: Building | null
}

export const BuildingForm: React.FC<BuildingFormProps> = ({ initialData }) => {
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

  const title = initialData ? "Edit Building" : "Create Building"
  const description = initialData ? "Edit building properties." : "Add a new building."
  const toastMessage = initialData ? "Building updated." : "Building created."
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

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          health: initialData.health || 0,
          attack: initialData.attack || 0,
          storage: initialData.storage || 0,
          level: initialData.level || 0,
          bulletSpeed: initialData.bulletSpeed || 0,
          fireRate: initialData.fireRate || 0,
          abilities: convertAbilities(initialData.abilities),
          isActive: initialData.isActive ?? true,
        }
      : {
          name: "",
          health: 0,
          attack: 0,
          storage: 0,
          level: 0,
          bulletSpeed: 0,
          fireRate: 0,
          abilities: [],
          isActive: true,
        },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        health: initialData.health || 0,
        attack: initialData.attack || 0,
        storage: initialData.storage || 0,
        level: initialData.level || 0,
        bulletSpeed: initialData.bulletSpeed || 0,
        fireRate: initialData.fireRate || 0,
        abilities: convertAbilities(initialData.abilities),
        isActive: initialData.isActive ?? true,
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: BuildingFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        const res = await fetch(
          `${getApiBaseUrl()}/entity/building?id=${initialData._id}`,
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
          `${getApiBaseUrl()}/entity/building`,
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
      router.push("/buildings")
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
        `${getApiBaseUrl()}/entity/building/?id=${initialData?._id}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        toast.success("Building deleted.")
        router.push("/buildings")
        router.refresh()
      } else {
        toast.error("Building not deleted.")
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
        <Link href="/buildings">
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
                        <Input disabled={loading} placeholder="Building name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
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
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage</FormLabel>
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
                <CardTitle>Turret</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bulletSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bullet Speed</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fireRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fire Rate</FormLabel>
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
