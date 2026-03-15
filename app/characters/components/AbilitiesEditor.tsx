"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Plus, Trash } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface AbilityValue {
  key: string | null;
  value: number | null;
}

interface Ability {
  description: string;
  v1: AbilityValue;
  v2: AbilityValue;
  v3: AbilityValue;
  v4: AbilityValue;
}

export const AbilitiesEditor = () => {
  const form = useFormContext();
  const abilities: Ability[] = form.watch("abilities") || [];

  /** Update only one field inside an ability */
  const updateField = (index: number, key: keyof Ability, value: any) => {
    const updated = [...abilities];
    updated[index][key] = value;
    form.setValue("abilities", updated);
  };

  /** Update v1–v4 inner objects */
  const updateValue = (
    index: number,
    vKey: "v1" | "v2" | "v3" | "v4",
    valueKey: "key" | "value",
    value: any
  ) => {
    const updated = [...abilities];
    updated[index][vKey] = {
      ...updated[index][vKey],
      [valueKey]: value,
    };
    form.setValue("abilities", updated);
  };

  /** Add new ability */
  const addAbility = () => {
    const newAb: Ability = {
      description: "",
      v1: { key: null, value: null },
      v2: { key: null, value: null },
      v3: { key: null, value: null },
      v4: { key: null, value: null },
    };

    form.setValue("abilities", [...abilities, newAb]);
  };

  /** Remove ability */
  const removeAbility = (index: number) => {
    form.setValue(
      "abilities",
      abilities.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Abilities
        </h3>

        <Button
          type="button"
          size="sm"
          onClick={addAbility}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Accordion List */}
      <Accordion type="multiple" className="space-y-3">
        {abilities.map((ability, index) => (
          <AccordionItem
            key={index}
            value={`ability-${index}`}
            className="border rounded-md bg-card px-3"
          >
            <AccordionTrigger className="py-2 text-left">
              <span className="text-sm font-medium">
                Ability {index + 1}:
              </span>
              <span className="ml-2 text-muted-foreground truncate">
                {ability.description || "No description"}
              </span>
            </AccordionTrigger>

            <AccordionContent className="space-y-4 py-3">
              {/* Description */}
              <Input
                placeholder="Ability description"
                value={ability.description}
                onChange={(e) =>
                  updateField(index, "description", e.target.value)
                }
                className="h-9"
              />

              {/* v1–v4 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["v1", "v2", "v3", "v4"] as const).map((vKey) => (
                  <div
                    key={vKey}
                    className="bg-secondary rounded p-3 space-y-2"
                  >
                    <p className="text-xs uppercase font-semibold">
                      {vKey}
                    </p>

                    <Input
                      placeholder="Key"
                      value={ability[vKey].key || ""}
                      onChange={(e) =>
                        updateValue(index, vKey, "key", e.target.value)
                      }
                      className="h-8"
                    />

                    <Input
                      type="number"
                      placeholder="Value"
                      value={ability[vKey].value || ""}
                      onChange={(e) =>
                        updateValue(
                          index,
                          vKey,
                          "value",
                          Number(e.target.value)
                        )
                      }
                      className="h-8"
                    />
                  </div>
                ))}
              </div>

              {/* Delete Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeAbility(index)}
                className="flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Remove Ability
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
