"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth"
import type { User } from "@/lib/Types"
import { ServerSwitchButton } from "@/components/server-toggle"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    if (!authService.isAuthenticated()) {
      router.push("/sign-in")
      return
    }

    // Get current user
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  /**
   * Get role-specific content based on user role
   */
  const getRoleContent = () => {
    switch (user.role) {
      case "admin":
        return {
          color: "bg-red-500",
        }
      case "developer":
        return {
          color: "bg-blue-500",
        }
    }
  }

  const roleContent = getRoleContent()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">
              {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>

        {/* Role Badge & Server Switch */}
        <div className="flex items-center gap-2">
          <Badge className={`${roleContent?.color} text-white`}>{user.role.toUpperCase()}</Badge>
          {user.profileComplete && <Badge variant="secondary">Profile Complete</Badge>}
          <ServerSwitchButton />
        </div>
      </div>
    </div>
  )
}