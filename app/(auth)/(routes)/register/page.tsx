"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Register page - redirects to sign-in since backend handles user creation automatically
 */
export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to sign-in page since registration is handled automatically
    router.replace("/sign-in")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Redirecting to Sign In...</h2>
        <p className="text-muted-foreground">New users are created automatically during the sign-in process.</p>
      </div>
    </div>
  )
}
