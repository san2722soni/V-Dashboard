"use client";

import type React from "react";
import { Heart, Swords, Crosshair, Weight, Eye, Zap, Gauge, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Character } from "@/lib/Types";

interface CharacterDetailsProps {
  character: Character;
}

export const CharacterDetails: React.FC<CharacterDetailsProps> = ({ character }) => {
  // Safe access to nested properties with fallbacks
  const movement = character.movement || {
    walkSpeed: 0,
    sprintSpeed: 0,
    strafeSpeed: 0,
    acceleration: 0,
    deceleration: 0,
    rotationSpeed: 0,
    jumpHeight: 0,
  };

  const abilities = character.abilities || [];
  const buildingsCanBuild = character.buildingsCanBuild || [];
  const buildingsCanUse = character.buildingsCanUse || [];
  const inventoriesCanUse = character.inventoriesCanUse || [];
  const inventoriesCanCraft = character.inventoriesCanCraft || [];

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">{character.name || "Unknown"}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Level {character.level ?? 1}</Badge>
            <Badge variant={character.isActive ? "default" : "destructive"}>
              {character.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={character.attackType === "Ranged" ? "default" : "secondary"}>
              {character.attackType || "Melee"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Basic Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health</CardTitle>
              <Heart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.health ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Health</CardTitle>
              <Heart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.maxHealth ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attack Damage</CardTitle>
              <Swords className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.attackDamage ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attack Range</CardTitle>
              <Crosshair className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.attackRange ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight</CardTitle>
              <Weight className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.weight ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vision</CardTitle>
              <Eye className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.vision ?? 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Capacity</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{character.inventoryCapacity ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Movement Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Movement</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Walk Speed</CardTitle>
              <Gauge className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.walkSpeed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sprint Speed</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.sprintSpeed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strafe Speed</CardTitle>
              <Gauge className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.strafeSpeed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceleration</CardTitle>
              <Gauge className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.acceleration}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deceleration</CardTitle>
              <Gauge className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.deceleration}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rotation Speed</CardTitle>
              <Gauge className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.rotationSpeed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jump Height</CardTitle>
              <Gauge className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movement.jumpHeight}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Buildings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Buildings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can Build</CardTitle>
            </CardHeader>
            <CardContent>
              {buildingsCanBuild.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {buildingsCanBuild.map((building, index) => (
                    <Badge key={index} variant="outline">
                      {building}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-primary">No buildings</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can Use</CardTitle>
            </CardHeader>
            <CardContent>
              {buildingsCanUse.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {buildingsCanUse.map((building, index) => (
                    <Badge key={index} variant="outline">
                      {building}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-primary">No buildings</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventories */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Inventories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can Use</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoriesCanUse.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {inventoriesCanUse.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-primary">No items</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can Craft</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoriesCanCraft.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {inventoriesCanCraft.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-primary">No items</p>
              )}
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
                      const keyData = item.abilityData?.[keyName];
                      if (!keyData?.description && !keyData?.value) return null;
                      return (
                        <div key={keyName} className="flex justify-between items-center p-2 bg-secondary rounded">
                          <span className="text-primary">{keyData?.description || keyName}</span>
                          <span className="font-semibold">{keyData?.value ?? 0}</span>
                        </div>
                      );
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
  );
};
