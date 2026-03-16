"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash, Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import { AlertModal } from "@/components/ui/modals/alert-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { Character, AbilityData, AbilityItem } from "@/lib/Types";

const movementSchema = z.object({
  walkSpeed: z.coerce.number().default(5),
  sprintSpeed: z.coerce.number().default(8),
  strafeSpeed: z.coerce.number().default(4),
  acceleration: z.coerce.number().default(2),
  deceleration: z.coerce.number().default(3),
  rotationSpeed: z.coerce.number().default(180),
  jumpHeight: z.coerce.number().default(2),
});

const abilityKeySchema = z.object({
  value: z.coerce.number().default(0),
  description: z.string().default(""),
});

const abilityDataSchema = z.object({
  Key1: abilityKeySchema.default({ value: 0, description: "" }),
  Key2: abilityKeySchema.default({ value: 0, description: "" }),
  Key3: abilityKeySchema.default({ value: 0, description: "" }),
  Key4: abilityKeySchema.default({ value: 0, description: "" }),
});

const abilityItemZodSchema = z.object({
  abilityName: z.string().min(1),
  abilityData: abilityDataSchema,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.coerce.number().min(1, "Level must be at least 1").default(1),
  weight: z.coerce.number().min(0, "Weight cannot be negative").default(0),
  health: z.coerce.number().min(0, "Health cannot be negative").default(100),
  maxHealth: z.coerce.number().min(0, "Max health cannot be negative").default(100),
  attackDamage: z.coerce.number().min(0, "Attack damage cannot be negative").default(0),
  attackType: z.enum(["Ranged", "Melee", "Throw"]).default("Melee"),
  attackRange: z.coerce.number().min(0, "Attack range cannot be negative").default(0),
  movement: movementSchema,
  vision: z.coerce.number().min(0, "Vision cannot be negative").default(10),
  inventoryCapacity: z.coerce.number().min(0, "Inventory capacity cannot be negative").default(20),
  buildingsCanBuild: z.array(z.string()).default([]),
  buildingsCanUse: z.array(z.string()).default([]),
  inventoriesCanUse: z.array(z.string()).default([]),
  inventoriesCanCraft: z.array(z.string()).default([]),
  abilities: z.array(abilityItemZodSchema).default([]),
  isActive: z.boolean().default(true),
});

type CharacterFormValues = z.infer<typeof formSchema>;

interface CharacterFormProps {
  initialData?: Character | null;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for managing list inputs
  const [buildingCanBuildInput, setBuildingCanBuildInput] = useState("");
  const [buildingCanUseInput, setBuildingCanUseInput] = useState("");
  const [inventoryCanUseInput, setInventoryCanUseInput] = useState("");
  const [inventoryCanCraftInput, setInventoryCanCraftInput] = useState("");

  // State for buildings and inventory items from database
  const [availableBuildings, setAvailableBuildings] = useState<Array<{ id: string; name: string }>>([]);
  const [availableInventory, setAvailableInventory] = useState<Array<{ id: string; name: string }>>([]);

  // State for managing abilities
  const [abilityName, setAbilityName] = useState("");
  const defaultAbilityData: AbilityData = {
    Key1: { value: 0, description: "" },
    Key2: { value: 0, description: "" },
    Key3: { value: 0, description: "" },
    Key4: { value: 0, description: "" },
  };
  const [newAbilityData, setNewAbilityData] = useState<AbilityData>({ ...defaultAbilityData });

  const title = initialData ? "Edit Character" : "Create Character";
  const description = initialData
    ? "Edit character properties."
    : "Add a new character.";
  const toastMessage = initialData ? "Character updated." : "Character created.";
  const action = initialData ? "Save Changes" : "Create";

  const convertAbilities = (abilities: any): AbilityItem[] => {
    if (!abilities || !Array.isArray(abilities)) return [];
    return abilities.map((item: any) => {
      const d = item.abilityData || {};
      return {
        abilityName: item.abilityName || "",
        abilityData: {
          Key1: { value: Number(d.Key1?.value) || 0, description: d.Key1?.description || "" },
          Key2: { value: Number(d.Key2?.value) || 0, description: d.Key2?.description || "" },
          Key3: { value: Number(d.Key3?.value) || 0, description: d.Key3?.description || "" },
          Key4: { value: Number(d.Key4?.value) || 0, description: d.Key4?.description || "" },
        },
      };
    });
  };

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          level: initialData.level || 1,
          weight: initialData.weight || 0,
          health: initialData.health || 100,
          maxHealth: initialData.maxHealth || 100,
          attackDamage: initialData.attackDamage || 0,
          attackType: initialData.attackType || "Melee",
          attackRange: initialData.attackRange || 0,
          movement: initialData.movement || {
            walkSpeed: 5,
            sprintSpeed: 8,
            strafeSpeed: 4,
            acceleration: 2,
            deceleration: 3,
            rotationSpeed: 180,
            jumpHeight: 2,
          },
          vision: initialData.vision || 10,
          inventoryCapacity: initialData.inventoryCapacity || 20,
          buildingsCanBuild: Array.isArray(initialData.buildingsCanBuild) ? initialData.buildingsCanBuild : [],
          buildingsCanUse: Array.isArray(initialData.buildingsCanUse) ? initialData.buildingsCanUse : [],
          inventoriesCanUse: Array.isArray(initialData.inventoriesCanUse) ? initialData.inventoriesCanUse : [],
          inventoriesCanCraft: Array.isArray(initialData.inventoriesCanCraft) ? initialData.inventoriesCanCraft : [],
          abilities: convertAbilities(initialData.abilities),
          isActive: initialData.isActive ?? true,
        }
      : {
          name: "",
          level: 1,
          weight: 0,
          health: 100,
          maxHealth: 100,
          attackDamage: 0,
          attackType: "Melee",
          attackRange: 0,
          movement: {
            walkSpeed: 5,
            sprintSpeed: 8,
            strafeSpeed: 4,
            acceleration: 2,
            deceleration: 3,
            rotationSpeed: 180,
            jumpHeight: 2,
          },
          vision: 10,
          inventoryCapacity: 20,
          buildingsCanBuild: [],
          buildingsCanUse: [],
          inventoriesCanUse: [],
          inventoriesCanCraft: [],
          abilities: [],
          isActive: true,
        },
  });

  // Fetch available buildings and inventory items
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch buildings
        const buildingsRes = await fetch(
          `${getApiBaseUrl()}/entity/building`,
          { cache: "no-store" }
        );
        if (buildingsRes.ok) {
          const buildingsData = await buildingsRes.json();
          setAvailableBuildings(
            buildingsData.map((b: any) => ({ id: b._id, name: b.name }))
          );
        }

        // Fetch inventory items
        const inventoryRes = await fetch(
          `${getApiBaseUrl()}/entity/inventory`,
          { cache: "no-store" }
        );
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          setAvailableInventory(
            inventoryData.map((i: any) => ({ id: i._id, name: i.name }))
          );
        }
      } catch (error) {
        // Error handling
      }
    };

    fetchData();
  }, []);

  // Reset form when initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        level: initialData.level || 1,
        weight: initialData.weight || 0,
        health: initialData.health || 100,
        maxHealth: initialData.maxHealth || 100,
        attackDamage: initialData.attackDamage || 0,
        attackType: initialData.attackType || "Melee",
        attackRange: initialData.attackRange || 0,
        movement: initialData.movement || {
          walkSpeed: 5,
          sprintSpeed: 8,
          strafeSpeed: 4,
          acceleration: 2,
          deceleration: 3,
          rotationSpeed: 180,
          jumpHeight: 2,
        },
        vision: initialData.vision || 10,
        inventoryCapacity: initialData.inventoryCapacity || 20,
        buildingsCanBuild: Array.isArray(initialData.buildingsCanBuild) ? initialData.buildingsCanBuild : [],
        buildingsCanUse: Array.isArray(initialData.buildingsCanUse) ? initialData.buildingsCanUse : [],
        inventoriesCanUse: Array.isArray(initialData.inventoriesCanUse) ? initialData.inventoriesCanUse : [],
        inventoriesCanCraft: Array.isArray(initialData.inventoriesCanCraft) ? initialData.inventoriesCanCraft : [],
        abilities: convertAbilities(initialData.abilities),
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CharacterFormValues) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!data.name || data.name.trim() === "") {
        toast.error("Character name is required");
        return;
      }

      let res;
      if (initialData) {
        res = await fetch(
          `${getApiBaseUrl()}/entity/character?id=${initialData._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates: data }),
          }
        );
      } else {
        res = await fetch(
          `${getApiBaseUrl()}/entity/character`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to ${initialData ? "update" : "create"} character`;
        toast.error(errorMessage);
        return;
      }

      toast.success(toastMessage);
      router.push("/characters");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${getApiBaseUrl()}/entity/character?id=${initialData!._id!}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Character deleted.");
        router.push("/characters");
        router.refresh();
      } else {
        toast.error("Character not deleted.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const addToArray = (fieldName: keyof CharacterFormValues, value: string) => {
    if (!value.trim()) {
      toast.warning("Please enter a value before adding");
      return;
    }
    const currentValues = form.getValues(fieldName) as string[];
    if (currentValues.includes(value.trim())) {
      toast.warning("This item has already been added");
      return;
    }
    form.setValue(fieldName, [...currentValues, value.trim()] as any);
  };

  const removeFromArray = (fieldName: keyof CharacterFormValues, index: number) => {
    const currentValues = form.getValues(fieldName) as string[];
    form.setValue(fieldName, currentValues.filter((_, i) => i !== index) as any);
  };

  const addAbility = () => {
    if (!abilityName.trim()) {
      toast.warning("Please enter an ability name before adding");
      return;
    }
    const currentAbilities = form.getValues("abilities");
    if (currentAbilities.some(a => a.abilityName === abilityName)) {
      toast.warning("An ability with this name already exists");
      return;
    }
    form.setValue("abilities", [
      ...currentAbilities,
      { abilityName, abilityData: { ...newAbilityData } },
    ]);
    setAbilityName("");
    setNewAbilityData({
      Key1: { value: 0, description: "" },
      Key2: { value: 0, description: "" },
      Key3: { value: 0, description: "" },
      Key4: { value: 0, description: "" },
    });
  };

  const removeAbility = (index: number) => {
    const currentAbilities = form.getValues("abilities");
    form.setValue("abilities", currentAbilities.filter((_, i) => i !== index));
  };

  const updateExistingAbilityKey = (index: number, keyName: keyof AbilityData, field: "value" | "description", fieldValue: number | string) => {
    const currentAbilities = [...form.getValues("abilities")];
    currentAbilities[index] = {
      ...currentAbilities[index],
      abilityData: {
        ...currentAbilities[index].abilityData,
        [keyName]: {
          ...currentAbilities[index].abilityData[keyName],
          [field]: fieldValue,
        },
      },
    };
    form.setValue("abilities", currentAbilities);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/characters">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Heading title={title} description={description} />
        </div>
        {initialData && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
            disabled={loading}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info Card */}
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
                        <Input disabled={loading} placeholder="Character name" {...field} />
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
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
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

            {/* Combat Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Combat Stats</CardTitle>
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
                  name="maxHealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Health</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attackDamage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attack Damage</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attackType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attack Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select attack type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Melee">Melee</SelectItem>
                          <SelectItem value="Ranged">Ranged</SelectItem>
                          <SelectItem value="Throw">Throw</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attackRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attack Range</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Movement Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Movement Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="movement.walkSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Walk Speed</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.sprintSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint Speed</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.strafeSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strafe Speed</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.acceleration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceleration</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.deceleration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deceleration</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.rotationSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rotation Speed</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movement.jumpHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jump Height</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Inventory Card */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="inventoryCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Capacity</FormLabel>
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

          {/* Buildings Section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="buildings">
              <AccordionTrigger>Buildings</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Buildings Can Build</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      value={buildingCanBuildInput}
                      onValueChange={setBuildingCanBuildInput}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a building" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBuildings.map((building) => (
                          <SelectItem key={building.id} value={building.name}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => {
                        addToArray("buildingsCanBuild", buildingCanBuildInput);
                        setBuildingCanBuildInput("");
                      }}
                      disabled={loading || !buildingCanBuildInput}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("buildingsCanBuild").map((item, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("buildingsCanBuild", index)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Buildings Can Use</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      value={buildingCanUseInput}
                      onValueChange={setBuildingCanUseInput}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a building" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBuildings.map((building) => (
                          <SelectItem key={building.id} value={building.name}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => {
                        addToArray("buildingsCanUse", buildingCanUseInput);
                        setBuildingCanUseInput("");
                      }}
                      disabled={loading || !buildingCanUseInput}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("buildingsCanUse").map((item, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("buildingsCanUse", index)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="inventories">
              <AccordionTrigger>Inventories</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Inventories Can Use</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      value={inventoryCanUseInput}
                      onValueChange={setInventoryCanUseInput}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an inventory item" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInventory.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => {
                        addToArray("inventoriesCanUse", inventoryCanUseInput);
                        setInventoryCanUseInput("");
                      }}
                      disabled={loading || !inventoryCanUseInput}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("inventoriesCanUse").map((item, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("inventoriesCanUse", index)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Inventories Can Craft</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      value={inventoryCanCraftInput}
                      onValueChange={setInventoryCanCraftInput}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an inventory item" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInventory.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => {
                        addToArray("inventoriesCanCraft", inventoryCanCraftInput);
                        setInventoryCanCraftInput("");
                      }}
                      disabled={loading || !inventoryCanCraftInput}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("inventoriesCanCraft").map((item, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("inventoriesCanCraft", index)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="abilities">
              <AccordionTrigger>Abilities</AccordionTrigger>
              <AccordionContent className="space-y-6">
                {/* Add New Ability Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Create New Ability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Ability Name</FormLabel>
                      <Input
                        placeholder="e.g., Fireball, Shield, Heal"
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

                    <Button
                      type="button"
                      onClick={addAbility}
                      disabled={loading || !abilityName.trim()}
                      className="w-full"
                    >
                      Save Ability
                    </Button>
                  </CardContent>
                </Card>

                {/* Current Abilities Section */}
                <div className="space-y-2">
                  <FormLabel>Existing Abilities</FormLabel>
                  {form.watch("abilities").length === 0 ? (
                    <p className="text-sm text-muted-foreground">No abilities added yet</p>
                  ) : (
                    form.watch("abilities").map((item, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{item.abilityName}</CardTitle>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeAbility(index)}
                              disabled={loading}
                            >
                              <Trash className="h-4 w-4" />
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
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
