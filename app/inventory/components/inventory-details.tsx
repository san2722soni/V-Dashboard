"use client"

import type React from "react"
import { Heart, Swords, Crosshair, Timer, CircleDot, Warehouse, Coins } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InventoryItem } from "@/lib/Types"

interface InventoryDetailsProps {
  item: InventoryItem
}

export const InventoryDetails: React.FC<InventoryDetailsProps> = ({ item }) => {
  const abilities = item.abilities || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={item.isActive ? "default" : "destructive"}>
              {item.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attack</CardTitle>
            <Swords className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.attack ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health</CardTitle>
            <Heart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.health ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Range</CardTitle>
            <Crosshair className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.range ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Timer className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.duration ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ammo</CardTitle>
            <CircleDot className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.round ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Cost</CardTitle>
            <Warehouse className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.storageCost ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Cost</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.purchaseCost ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Abilities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Abilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abilities.length > 0 ? (
            abilities.map((ability, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{ability.abilityName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {(["Key1", "Key2", "Key3", "Key4"] as const).map((keyName) => {
                      const keyData = ability.abilityData?.[keyName]
                      if (!keyData?.description && !keyData?.value) return null
                      return (
                        <div key={keyName} className="flex justify-between items-center p-2 bg-secondary rounded">
                          <span className="text-muted-foreground">{keyData?.description || keyName}</span>
                          <span className="font-semibold">{keyData?.value ?? 0}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">No abilities defined</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
