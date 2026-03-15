"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

/**
 * Root page - redirects based on authentication status
 */
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      // Redirect to dashboard if authenticated
      router.push("/dashboard")
    } else {
      // Redirect to sign-in if not authenticated
      router.push("/sign-in")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Loading...</h2>
        <p className="text-muted-foreground">Checking authentication status...</p>
      </div>
    </div>
  )
}
