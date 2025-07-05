"use client"

import type React from "react"

import { useState } from "react"

interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

export default function TestAuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loginResponse, setLoginResponse] = useState<string>("")
  const [registerResponse, setRegisterResponse] = useState<string>("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginLoading(true)
    setLoginResponse("")

    const formData = new FormData(event.currentTarget)
    const payload = {
      public_key: formData.get("publicKey") as string,
      secret_key: formData.get("secretKey") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      hwid: (formData.get("hwid") as string) || undefined,
    }

    try {
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setLoginResponse(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setLoginResponse(`Network Error: ${error.message}`)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRegisterLoading(true)
    setRegisterResponse("")

    const formData = new FormData(event.currentTarget)
    const payload = {
      public_key: formData.get("publicKey") as string,
      secret_key: formData.get("secretKey") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      license_key: formData.get("licenseKey") as string,
      hwid: (formData.get("hwid") as string) || undefined,
    }

    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setRegisterResponse(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setRegisterResponse(`Network Error: ${error.message}`)
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🏰 Chess Auth API Tester</h1>
          <p className="text-xl opacity-90">Test your authentication endpoints</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 border-b">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === "login"
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Login Test
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === "register"
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Register Test
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Login Test</h3>
              <p className="text-blue-700">Test the login endpoint with existing user credentials.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                  <input
                    type="text"
                    name="publicKey"
                    defaultValue="pk_chess_demo123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pk_chess_..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                  <input
                    type="text"
                    name="secretKey"
                    defaultValue="sk_chess_demo456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sk_chess_..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue="testplayer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="player1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    defaultValue="secure123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="secure123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HWID (Optional)</label>
                <input
                  type="text"
                  name="hwid"
                  defaultValue="demo-hardware-id"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="unique-hardware-id"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {loginResponse && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Response:</h3>
                <pre
                  className={`p-4 rounded-lg text-sm overflow-auto max-h-64 ${
                    loginResponse.includes('"success": true')
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {loginResponse}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <div className="p-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Registration Test</h3>
              <p className="text-green-700">Test the registration endpoint with a valid license key.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                  <input
                    type="text"
                    name="publicKey"
                    defaultValue="pk_chess_demo123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pk_chess_..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                  <input
                    type="text"
                    name="secretKey"
                    defaultValue="sk_chess_demo456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sk_chess_..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue="newplayer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="newplayer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    defaultValue="secure123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="secure123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Key</label>
                <input
                  type="text"
                  name="licenseKey"
                  defaultValue="lic_chess_demo789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="lic_chess_..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HWID (Optional)</label>
                <input
                  type="text"
                  name="hwid"
                  defaultValue="demo-hardware-id"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="unique-hardware-id"
                />
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {registerLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </form>

            {registerResponse && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Response:</h3>
                <pre
                  className={`p-4 rounded-lg text-sm overflow-auto max-h-64 ${
                    registerResponse.includes('"success": true')
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {registerResponse}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
