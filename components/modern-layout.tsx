"use client"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Crown, Shield, Zap, ArrowLeft, Settings } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ModernLayoutProps {
  children: ReactNode
  title?: string
  showLogout?: boolean
  showBack?: boolean
  showSettings?: boolean
  onLogout?: () => void
  onSettings?: () => void
}

export function ModernLayout({
  children,
  title,
  showLogout = false,
  showBack = false,
  showSettings = false,
  onLogout,
  onSettings,
}: ModernLayoutProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in by checking for token
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const handleTitleClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 chess-bg flex flex-col">
      {/* Navigation */}
      <nav className="glass border-b border-yellow-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {showBack && (
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="relative">
                <Crown className="h-8 w-8 text-yellow-500 chess-float" />
                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
              </div>
              <div className="cursor-pointer" onClick={handleTitleClick}>
                <h1 className="text-2xl font-bold gradient-text hover:text-yellow-400 transition-colors">ChessAuth</h1>
                <p className="text-xs text-gray-400">Professional Authentication</p>
              </div>
            </div>

            {/* Title */}
            {title && (
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {showSettings && (
                <Button
                  onClick={onSettings}
                  variant="outline"
                  size="sm"
                  className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10 hover:border-gray-500 bg-transparent"
                >
                  <Settings className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              )}
              {showLogout && (
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">{children}</main>

      {/* Footer */}
      <footer className="glass border-t border-yellow-500/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-400">© 2025 ChessAuth. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1">
                <Crown className="h-4 w-4" />
                <span>Professional</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
