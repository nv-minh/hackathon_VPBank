"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleKeycloakSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("keycloak", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleKeycloakSignIn}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          "Đăng nhập với Keycloak"
        )}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <p>Chưa có tài khoản? Liên hệ quản trị viên để được cấp tài khoản.</p>
      </div>
    </div>
  )
}
