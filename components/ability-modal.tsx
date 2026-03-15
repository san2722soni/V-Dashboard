"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Ability = {
  description: string;
  v1?: { key: string; value: number };
  v2?: { key: string; value: number };
  v3?: { key: string; value: number };
  v4?: { key: string; value: number };
};

export function AbilityModal({ abilities }: { abilities: Ability[] }) {
  const [open, setOpen] = useState(false);

  const renderValues = (ab: Ability) => {
    return ["v1", "v2", "v3", "v4"]
      .map((k) => ab[k as keyof Ability] as any)
      .filter((v) => v && (v.key || v.value))
      .map((v, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <Badge variant="outline">{v.key}</Badge>
          <span className="text-muted-foreground">= {v.value}</span>
        </div>
      ));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs"
      >
        View Abilities ({abilities.length})
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Character Abilities
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {abilities.map((ab, i) => (
              <div
                key={i}
                className="border p-3 rounded-lg bg-muted/60 space-y-2"
              >
                {/* Ability number + description */}
                <div className="flex items-start gap-2">
                  <Badge variant="default">{i + 1}</Badge>
                  <p className="text-sm">{ab.description}</p>
                </div>

                {/* v1 - v4 values */}
                <div className="pl-8 space-y-1">{renderValues(ab)}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
