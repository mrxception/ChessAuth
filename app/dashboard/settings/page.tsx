"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { MessageBox, type MessageBoxProps } from "@/components/message-box"
import { Settings, Shield, Trash2, MessageSquare, AlertCircle, CheckCircle, Save, X, Loader2 } from "lucide-react"

interface Application {
  id: number
  app_name: string
  public_key: string
  secret_key: string
  hwid_lock: boolean
  status: string
  created_at: string
}

interface AppSettings {
  id: number
  application_id: number
  login_success_msg: string
  login_error_msg: string
  sub_expired_msg: string
  banned_msg: string
  hwid_mismatch_msg: string
}

export default function SettingsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState("")
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [hwidLoading, setHwidLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  
  const [messageBox, setMessageBox] = useState<Omit<MessageBoxProps, "isOpen"> & { isOpen: boolean }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: undefined,
    onCancel: undefined,
  })

  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchApplications()
  }, [])

  useEffect(() => {
    if (selectedApp) {
      fetchAppSettings()
    } else {
      setAppSettings(null)
    }
  }, [selectedApp])

  
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const showMessageBox = (config: Omit<MessageBoxProps, "isOpen" | "onClose">) => {
    setMessageBox({
      ...config,
      isOpen: true,
    })
  }

  const hideMessageBox = () => {
    setMessageBox((prev) => ({ ...prev, isOpen: false }))
  }

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    setLoading(false)
  }

  const fetchApplications = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
        if (data.applications.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0].id.toString())
        }
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
      setError("Failed to load applications")
    }
  }

  const fetchAppSettings = async () => {
    if (!selectedApp) return
    setSettingsLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAppSettings(data.settings)
      } else {
        setError("Failed to load application settings")
      }
    } catch (error) {
      console.error("Failed to fetch app settings:", error)
      setError("Network error while loading settings")
    } finally {
      setSettingsLoading(false)
    }
  }

  const updateAppStatus = async (status: string) => {
    setStatusLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchApplications()
        setSuccess(`Application ${status === "active" ? "enabled" : "disabled"} successfully!`)
      } else {
        setError("Failed to update application status")
      }
    } catch (error) {
      setError("Failed to update application status")
    } finally {
      setStatusLoading(false)
    }
  }

  const updateHwidLock = async (hwid_lock: boolean) => {
    setHwidLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hwid_lock }),
      })
      if (response.ok) {
        fetchApplications()
        setSuccess(`HWID Lock ${hwid_lock ? "enabled" : "disabled"} successfully!`)
      } else {
        setError("Failed to update HWID lock")
      }
    } catch (error) {
      setError("Failed to update HWID lock")
    } finally {
      setHwidLoading(false)
    }
  }

  const saveMessages = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appSettings) return

    setPasswordLoading(true)
    setError("")
    setSuccess("")
    const token = localStorage.getItem("token")

    try {
      const response = await fetch(`/api/applications/${selectedApp}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          login_success_msg: appSettings.login_success_msg,
          login_error_msg: appSettings.login_error_msg,
          sub_expired_msg: appSettings.sub_expired_msg,
          banned_msg: appSettings.banned_msg,
          hwid_mismatch_msg: appSettings.hwid_mismatch_msg,
        }),
      })

      if (response.ok) {
        setSuccess("Messages updated successfully!")
      } else {
        setError("Failed to update messages")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setPasswordLoading(false)
    }
  }

  const confirmDeleteApplication = () => {
    const selectedApplication = applications.find((app) => app.id.toString() === selectedApp)
    if (!selectedApplication) return

    showMessageBox({
      type: "confirm",
      title: "Delete Application",
      message: `Are you sure you want to delete "${selectedApplication.app_name}"? This action cannot be undone and will permanently delete all users, licenses, and settings associated with this application.`,
      confirmText: "Delete Forever",
      cancelText: "Cancel",
      onConfirm: deleteApplication,
    })
  }

  const deleteApplication = async () => {
    setDeleteLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setSuccess("Application deleted successfully!")
        
        setSelectedApp("")
        setAppSettings(null)
        fetchApplications()
      } else {
        setError(data.message || "Failed to delete application")
      }
    } catch (error) {
      console.error("Delete error:", error)
      setError("Network error occurred while deleting application")
    } finally {
      setDeleteLoading(false)
    }
  }

  const selectedApplication = applications.find((app) => app.id.toString() === selectedApp)

  if (loading) {
    return (
      <ModernLayout showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout showBack>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <Settings className="mr-3 h-8 w-8" />
              Application Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure your application settings and messages</p>
          </div>
          <div className="relative">
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 bg-gray-800/80 border border-gray-600 text-white rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 backdrop-blur-sm min-w-[200px]"
            >
              <option value="">Select Application</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id.toString()} className="bg-gray-800">
                  {app.app_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400">{success}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess("")}
              className="text-green-400 hover:text-green-300 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {selectedApplication ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Controls */}
            <ModernCard>
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Application Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Application Status */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">Application Status</h3>
                    <p className="text-sm text-gray-400">Enable or disable your application</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedApplication.status === "active"
                          ? "bg-green-500/20 text-green-400 border border-green-500/50"
                          : "bg-red-500/20 text-red-400 border border-red-500/50"
                      }`}
                    >
                      {selectedApplication.status}
                    </span>
                    <Switch
                      checked={selectedApplication.status === "active"}
                      onCheckedChange={(checked) => updateAppStatus(checked ? "active" : "suspended")}
                      disabled={statusLoading}
                    />
                  </div>
                </div>

                {/* HWID Lock */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">HWID Lock</h3>
                    <p className="text-sm text-gray-400">Require hardware ID verification</p>
                  </div>
                  <Switch
                    checked={selectedApplication.hwid_lock}
                    onCheckedChange={updateHwidLock}
                    disabled={hwidLoading}
                  />
                </div>

                {/* Application Info */}
                <div className="p-4 bg-black/20 rounded-lg space-y-2">
                  <h3 className="font-semibold text-white">Application Info</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>
                      <span className="text-gray-300">Name:</span> {selectedApplication.app_name}
                    </p>
                    <p>
                      <span className="text-gray-300">Created:</span>{" "}
                      {new Date(selectedApplication.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-gray-300">Public Key:</span>{" "}
                      {selectedApplication.public_key.substring(0, 20)}...
                    </p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Permanently delete this application and all associated data.
                  </p>
                  <Button
                    onClick={confirmDeleteApplication}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </ModernCard>

            {/* Custom Messages */}
            <ModernCard>
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Custom Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appSettings ? (
                  <form onSubmit={saveMessages} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login_success">Login Success Message</Label>
                      <Input
                        id="login_success"
                        value={appSettings.login_success_msg}
                        onChange={(e) => setAppSettings({ ...appSettings, login_success_msg: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white"
                        placeholder="Login successful"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login_error">Login Error Message</Label>
                      <Input
                        id="login_error"
                        value={appSettings.login_error_msg}
                        onChange={(e) => setAppSettings({ ...appSettings, login_error_msg: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white"
                        placeholder="Invalid credentials"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sub_expired">Subscription Expired Message</Label>
                      <Input
                        id="sub_expired"
                        value={appSettings.sub_expired_msg}
                        onChange={(e) => setAppSettings({ ...appSettings, sub_expired_msg: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white"
                        placeholder="Subscription expired"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banned">Banned User Message</Label>
                      <Input
                        id="banned"
                        value={appSettings.banned_msg}
                        onChange={(e) => setAppSettings({ ...appSettings, banned_msg: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white"
                        placeholder="Account banned"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hwid_mismatch">HWID Mismatch Message</Label>
                      <Input
                        id="hwid_mismatch"
                        value={appSettings.hwid_mismatch_msg}
                        onChange={(e) => setAppSettings({ ...appSettings, hwid_mismatch_msg: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white"
                        placeholder="HWID mismatch"
                      />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-blue-400 text-sm">
                        💡 <strong>Tip:</strong> These messages will be shown to users when they interact with your
                        application. Keep them clear and helpful.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                    >
                      {passwordLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>Save Messages</span>
                        </div>
                      )}
                    </Button>
                  </form>
                ) : settingsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading custom messages...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-8 w-8 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Failed to load settings</p>
                  </div>
                )}
              </CardContent>
            </ModernCard>
          </div>
        ) : (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Application Selected</h3>
            <p className="text-gray-500">Select an application to configure its settings</p>
          </div>
        )}

        {/* Custom Message Box */}
        <MessageBox
          isOpen={messageBox.isOpen}
          type={messageBox.type}
          title={messageBox.title}
          message={messageBox.message}
          confirmText={messageBox.confirmText}
          cancelText={messageBox.cancelText}
          onConfirm={messageBox.onConfirm}
          onCancel={messageBox.onCancel}
          onClose={hideMessageBox}
        />
      </div>
    </ModernLayout>
  )
}
