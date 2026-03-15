"use client"

import type React from "react"
import { Heart, Swords, Package, ArrowUp, Crosshair, Gauge } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Building } from "@/lib/Types"

interface BuildingDetailsProps {
  building: Building
}

export const BuildingDetails: React.FC<BuildingDetailsProps> = ({ building }) => {
  const abilities = building.abilities || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{building.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={building.isActive ? "default" : "destructive"}>
              {building.isActive ? "Active" : "Inactive"}
            </Badge>
            {building.level != null && (
              <Badge variant="outline">Level {building.level}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health</CardTitle>
            <Heart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{building.health ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attack</CardTitle>
            <Swords className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{building.attack ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{building.storage ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <ArrowUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{building.level ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Turret */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Turret</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bullet Speed</CardTitle>
              <Crosshair className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{building.bulletSpeed ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fire Rate</CardTitle>
              <Gauge className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{building.fireRate ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abilities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Abilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abilities.length > 0 ? (
            abilities.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{item.abilityName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {(["Key1", "Key2", "Key3", "Key4"] as const).map((keyName) => {
                      const keyData = item.abilityData?.[keyName]
                      if (!keyData?.description && !keyData?.value) return null
                      return (
                        <div key={keyName} className="flex justify-between items-center p-2 bg-secondary rounded">
                          <span className="text-primary">{keyData?.description || keyName}</span>
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
                <p className="text-sm text-primary">No abilities defined</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
