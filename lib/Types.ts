// Authentication types for the application here

// Authentication types for the application
export interface User {
  id: string
  email: string
  role: "user" | "developer" | "admin"
  profileComplete: boolean
  profile?: {
    name?: string
    role?: string
    gender?: string
    permissions?: string
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  success: boolean;
  message?: string;
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Ability types

export interface AbilityKey {
  value: number
  description: string
}

export interface AbilityData {
  Key1: AbilityKey
  Key2: AbilityKey
  Key3: AbilityKey
  Key4: AbilityKey
}

export interface AbilityItem {
  abilityName: string
  abilityData: AbilityData
}

// Character types

export interface CharacterMovement {
  walkSpeed: number
  sprintSpeed: number
  strafeSpeed: number
  acceleration: number
  deceleration: number
  rotationSpeed: number
  jumpHeight: number
}

export interface Character {
  _id?: string
  name: string
  level: number
  weight: number
  health: number
  maxHealth: number
  attackDamage: number
  attackType: "Ranged" | "Melee" | "Throw"
  attackRange: number
  movement: CharacterMovement
  vision: number
  inventoryCapacity: number
  buildingsCanBuild: string[]
  buildingsCanUse: string[]
  inventoriesCanUse: string[]
  inventoriesCanCraft: string[]
  abilities: AbilityItem[]
  isActive: boolean
}

// Building types

export interface Building {
  _id?: string
  name: string
  health: number
  attack: number
  storage: number
  level: number
  bulletSpeed: number
  fireRate: number
  abilities: AbilityItem[]
  isActive: boolean
}

export interface BuildingColumn {
  id: string
  name: string
  health: number
  attack: number
  storage: number
  level: number
  isActive: boolean
}

// Inventory types

export interface InventoryItem {
  _id?: string
  name: string
  attack: number
  health: number
  range: number
  duration: number
  round: number
  storageCost: number
  purchaseCost: number
  abilities: AbilityItem[]
  isActive: boolean
}

export interface InventoryColumn {
  id: string
  name: string
  attack: number
  health: number
  range: number
  duration: number
  round: number
  storageCost: number
  purchaseCost: number
  isActive: boolean
}

// Global Config types

export interface GlobalConfigEntry {
  _id?: string
  key: string
  value: string | number | boolean
  valueType: "string" | "number" | "boolean"
}

export interface GlobalConfigColumn {
  id: string
  key: string
  value: string | number | boolean
  valueType: "string" | "number" | "boolean"
}

export interface CharacterColumn {
  id: string
  name: string
  level: number
  health: number
  attackDamage: number
  attackType: "Ranged" | "Melee" | "Throw"
  weight: number
  isActive: boolean
}

// Query types

export interface Query {
  _id: string
  creator: {
    developerId: string
    email: string
  }
  type: "mongo" | "redis"
  queryString: string
  description: string
  status: "pending" | "approved" | "rejected"
  approvedBy: { developerId: string; email: string } | null
  result: any
  executedAt: string | null
  createdAt: string
  updatedAt: string
}