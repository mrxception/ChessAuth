"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const msg = searchParams.get("message")
    if (msg) setMessage(msg)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModernLayout showBack>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <ModernCard hover={false}>
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto p-4 bg-yellow-500/10 rounded-full w-fit">
                <Crown className="h-12 w-12 text-yellow-500 chess-float" />
              </div>
              <div>
                <CardTitle className="text-3xl gradient-text">Welcome Back</CardTitle>
                <p className="text-gray-400 mt-2">Sign in to your ChessAuth account</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 text-sm">{message}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Username or Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="pl-10 bg-black/20 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-black/20 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 hover-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5" />
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <Link href="/register" className="text-yellow-500 hover:text-yellow-400 font-medium">
                    Don't have an account? Create one
                  </Link>
                </div>
              </div>
            </CardContent>
          </ModernCard>
        </div>
      </div>
    </ModernLayout>
  )
}
