"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageBox, type MessageBoxProps } from "@/components/message-box"
import {
  Plus,
  Lock,
  Calendar,
  Ban,
  UserCheck,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Loader2,
  Users,
} from "lucide-react"

interface UserInterface {
  id: number
  username: string
  license_key: string
  subscription_type: string
  expires_at: string | null
  is_banned: boolean
  hwid: string | null
  created_at: string
  last_login: string | null
}

interface Application {
  id: number
  app_name: string
  user_id: number
  public_key: string
  secret_key: string
  status: string
  hwid_lock: boolean
  created_at: string
  updated_at: string
}

interface ApplicationsResponse {
  applications: Application[]
}

interface UsersResponse {
  users: UserInterface[]
}

interface ApiResponse {
  success: boolean
  message?: string
}

interface FormData {
  username: string
  password: string
  subscription_type: string
  expires_at: string
  duration_days: string
}

interface ExtendData {
  expires_at: string
  duration_days: string
}

interface ActionLoading {
  [key: string]: boolean
}

type SortField = "username" | "subscription_type" | "expires_at" | "created_at"
type SortDirection = "asc" | "desc"

export default function UsersPage() {
  const [users, setUsers] = useState<UserInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showExtendForm, setShowExtendForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    subscription_type: "free",
    expires_at: "",
    duration_days: "",
  })
  const [extendData, setExtendData] = useState<ExtendData>({
    expires_at: "",
    duration_days: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [actionLoading, setActionLoading] = useState<ActionLoading>({})
  const [createLoading, setCreateLoading] = useState(false)
  const [extendLoading, setExtendLoading] = useState(false)

  const [messageBox, setMessageBox] = useState<Omit<MessageBoxProps, "isOpen"> & { isOpen: boolean }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: undefined,
    onCancel: undefined,
  })

  const router = useRouter()

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    setLoading(false)
  }, [router])

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data: ApplicationsResponse = await response.json()
        setApplications(data.applications)
        if (data.applications.length > 0) {
          setSelectedApp(data.applications[0].id.toString())
        }
      }
    } catch {
      console.error("Failed to fetch applications")
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    if (!selectedApp) return
    setUsersLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data: UsersResponse = await response.json()
        setUsers(data.users || [])
      }
    } catch {
      console.error("Failed to fetch users")
      setError("Failed to load users")
    } finally {
      setUsersLoading(false)
    }
  }, [selectedApp])

  useEffect(() => {
    checkAuth()
    fetchApplications()
  }, [checkAuth, fetchApplications])

  useEffect(() => {
    if (selectedApp) {
      fetchUsers()
    } else {
      setUsers([])
    }
  }, [selectedApp, fetchUsers])

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

  const setUserActionLoading = (userId: number, action: string, loading: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [`${userId}-${action}`]: loading,
    }))
  }

  const isUserActionLoading = (userId: number, action: string) => {
    return actionLoading[`${userId}-${action}`] || false
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError("")
    setSuccess("")
    const token = localStorage.getItem("token")

    let expiresAt = null
    if (formData.expires_at) {
      expiresAt = formData.expires_at
    } else if (formData.duration_days) {
      const date = new Date()
      date.setDate(date.getDate() + Number.parseInt(formData.duration_days))
      expiresAt = date.toISOString().split("T")[0]
    }

    try {
      const response = await fetch(`/api/applications/${selectedApp}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          subscription_type: formData.subscription_type,
          expires_at: expiresAt,
        }),
      })
      const data: ApiResponse = await response.json()
      if (data.success) {
        setSuccess("User created successfully!")
        setFormData({
          username: "",
          password: "",
          subscription_type: "free",
          expires_at: "",
          duration_days: "",
        })
        setShowCreateForm(false)
        fetchUsers()
      } else {
        setError(data.message || "Failed to create user")
      }
    } catch {
      setError("Network error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const extendUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setExtendLoading(true)
    setError("")
    setSuccess("")
    const token = localStorage.getItem("token")

    let newExpiresAt = null
    if (extendData.expires_at) {
      newExpiresAt = extendData.expires_at
    } else if (extendData.duration_days) {
      const currentExpiry = selectedUser.expires_at ? new Date(selectedUser.expires_at) : new Date()
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()
      baseDate.setDate(baseDate.getDate() + Number.parseInt(extendData.duration_days))
      newExpiresAt = baseDate.toISOString().split("T")[0]
    }

    try {
      const response = await fetch(`/api/applications/${selectedApp}/users/${selectedUser.id}/extend`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expires_at: newExpiresAt,
        }),
      })
      const data: ApiResponse = await response.json()
      if (data.success) {
        setSuccess(`User ${selectedUser.username} expiration extended successfully!`)
        setExtendData({
          expires_at: "",
          duration_days: "",
        })
        setShowExtendForm(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError(data.message || "Failed to extend user")
      }
    } catch {
      setError("Network error occurred")
    } finally {
      setExtendLoading(false)
    }
  }

  const toggleBanUser = async (userId: number, currentBanStatus: boolean, username: string) => {
    setUserActionLoading(userId, "ban", true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}/users/${userId}/ban`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_banned: !currentBanStatus }),
      })
      if (response.ok) {
        fetchUsers()
        setSuccess(`User ${username} ${!currentBanStatus ? "banned" : "unbanned"} successfully!`)
      } else {
        setError("Failed to update user status")
      }
    } catch {
      setError("Failed to update user status")
    } finally {
      setUserActionLoading(userId, "ban", false)
    }
  }

  const resetHwid = async (userId: number, username: string) => {
    showMessageBox({
      type: "confirm",
      title: "Reset HWID",
      message: `Are you sure you want to reset the HWID for user "${username}"? This will force them to re-authenticate on their next login.`,
      confirmText: "Reset HWID",
      cancelText: "Cancel",
      onConfirm: async () => {
        setUserActionLoading(userId, "hwid", true)
        const token = localStorage.getItem("token")
        try {
          const response = await fetch(`/api/applications/${selectedApp}/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reset_hwid: true }),
          })
          const data: ApiResponse = await response.json()
          if (data.success) {
            fetchUsers()
            setSuccess(`HWID reset successfully for user "${username}"!`)
          } else {
            setError(data.message || "Failed to reset HWID")
          }
        } catch {
          setError("Failed to reset HWID")
        } finally {
          setUserActionLoading(userId, "hwid", false)
        }
      },
    })
  }

  const deleteUser = async (userId: number, username: string) => {
    showMessageBox({
      type: "confirm",
      title: "Delete User",
      message: `Are you sure you want to delete user "${username}"? This action cannot be undone and will permanently remove all user data.`,
      confirmText: "Delete User",
      cancelText: "Cancel",
      onConfirm: async () => {
        setUserActionLoading(userId, "delete", true)
        const token = localStorage.getItem("token")
        try {
          const response = await fetch(`/api/applications/${selectedApp}/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            fetchUsers()
            setSuccess("User deleted successfully!")
          } else {
            setError("Failed to delete user")
          }
        } catch {
          setError("Failed to delete user")
        } finally {
          setUserActionLoading(userId, "delete", false)
        }
      },
    })
  }

  const openExtendModal = (user: UserInterface) => {
    setSelectedUser(user)
    setShowExtendForm(true)
    setExtendData({
      expires_at: "",
      duration_days: "",
    })
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !user.is_banned) ||
      (filterStatus === "banned" && user.is_banned) ||
      (filterStatus === "expired" && user.expires_at && new Date(user.expires_at) < new Date())

    return matchesSearch && matchesFilter
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string | number = a[sortField] || ""
    let bValue: string | number = b[sortField] || ""

    if (sortField === "expires_at" || sortField === "created_at") {
      aValue = aValue ? new Date(aValue as string).getTime() : 0
      bValue = bValue ? new Date(bValue as string).getTime() : 0
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = sortedUsers.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getStatusBadge = (user: UserInterface) => {
    if (user.is_banned) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/50">
          Banned
        </span>
      )
    }
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/50">
          Expired
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
        Active
      </span>
    )
  }

  if (loading) {
    return (
      <ModernLayout showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
            <p className="text-gray-400">Loading users...</p>
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
              <Users className="mr-3 h-8 w-8" />
              User Management
            </h1>
            <p className="text-gray-400 mt-1">Manage users and their access permissions</p>
          </div>
          <div className="flex items-center space-x-4">
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
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
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

        {/* Create User Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="gradient-text">Create New User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="pl-10 bg-black/20 border-gray-600 text-white"
                        placeholder="Enter username"
                        required
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 bg-black/20 border-gray-600 text-white"
                        placeholder="Enter password"
                        required
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription">Subscription Type</Label>
                    <select
                      value={formData.subscription_type}
                      onChange={(e) => setFormData({ ...formData, subscription_type: e.target.value })}
                      className="appearance-none w-full px-3 py-2 pr-8 bg-gray-800/80 border border-gray-600 text-white rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 backdrop-blur-sm"
                      disabled={createLoading}
                    >
                      <option value="free" className="bg-gray-800">
                        Free
                      </option>
                      <option value="pro" className="bg-gray-800">
                        Pro
                      </option>
                      <option value="premium" className="bg-gray-800">
                        Premium
                      </option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expires_at">Expiration Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="expires_at"
                          type="date"
                          value={formData.expires_at}
                          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value, duration_days: "" })}
                          className="pl-10 bg-black/20 border-gray-600 text-white"
                          disabled={createLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Or Duration (Days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value, expires_at: "" })}
                        className="bg-black/20 border-gray-600 text-white"
                        placeholder="30"
                        disabled={createLoading}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                    >
                      {createLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        "Create User"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-gray-600 text-gray-300"
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Extend User Modal */}
        {showExtendForm && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="gradient-text">Extend User Expiration</CardTitle>
                <p className="text-gray-400 text-sm">
                  Extending: <span className="text-white font-medium">{selectedUser.username}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Current expiry:{" "}
                  {selectedUser.expires_at ? new Date(selectedUser.expires_at).toLocaleDateString() : "Never"}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={extendUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="extend_expires_at">New Expiration Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="extend_expires_at"
                          type="date"
                          value={extendData.expires_at}
                          onChange={(e) =>
                            setExtendData({ ...extendData, expires_at: e.target.value, duration_days: "" })
                          }
                          className="pl-10 bg-black/20 border-gray-600 text-white"
                          disabled={extendLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="extend_duration">Or Add Days</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="extend_duration"
                          type="number"
                          value={extendData.duration_days}
                          onChange={(e) =>
                            setExtendData({ ...extendData, duration_days: e.target.value, expires_at: "" })
                          }
                          className="pl-10 bg-black/20 border-gray-600 text-white"
                          placeholder="30"
                          disabled={extendLoading}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>Tip:</strong> Adding days will extend from the current expiry date (or today if already
                      expired)
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={extendLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      {extendLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Extending...</span>
                        </div>
                      ) : (
                        "Extend Expiration"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowExtendForm(false)
                        setSelectedUser(null)
                      }}
                      className="border-gray-600 text-gray-300"
                      disabled={extendLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Filters */}
        <ModernCard>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-800/80 border border-gray-600 text-white rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 backdrop-blur-sm min-w-[150px]"
                >
                  <option value="all" className="bg-gray-800">
                    All Users
                  </option>
                  <option value="active" className="bg-gray-800">
                    Active
                  </option>
                  <option value="banned" className="bg-gray-800">
                    Banned
                  </option>
                  <option value="expired" className="bg-gray-800">
                    Expired
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </ModernCard>

        {/* Users Table */}
        <ModernCard>
          <CardHeader>
            <CardTitle className="gradient-text">
              Users ({filteredUsers.length}) - Page {currentPage} of {totalPages || 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
                  <p className="text-gray-400">Loading users...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("username")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Username</span>
                          {getSortIcon("username")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">License Key</th>
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("subscription_type")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Subscription</span>
                          {getSortIcon("subscription_type")}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("expires_at")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Expires</span>
                          {getSortIcon("expires_at")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300">HWID</th>
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("created_at")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {getSortIcon("created_at")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-medium text-white">{user.username}</td>
                        <td className="py-3 px-4 font-mono text-sm text-gray-300">
                          {user.license_key ? `${user.license_key.substring(0, 20)}...` : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                            {user.subscription_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {user.expires_at ? new Date(user.expires_at).toLocaleDateString() : "Never"}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(user)}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {user.hwid ? (
                            <span className="font-mono text-xs">{user.hwid.substring(0, 8)}...</span>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openExtendModal(user)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Extend expiration"
                              disabled={isUserActionLoading(user.id, "extend")}
                            >
                              {isUserActionLoading(user.id, "extend") ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resetHwid(user.id, user.username)}
                              className="text-purple-400 hover:text-purple-300"
                              title="Reset HWID"
                              disabled={!user.hwid || isUserActionLoading(user.id, "hwid")}
                            >
                              {isUserActionLoading(user.id, "hwid") ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleBanUser(user.id, user.is_banned, user.username)}
                              className={
                                user.is_banned
                                  ? "text-green-400 hover:text-green-300"
                                  : "text-orange-400 hover:text-orange-300"
                              }
                              title={user.is_banned ? "Unban user" : "Ban user"}
                              disabled={isUserActionLoading(user.id, "ban")}
                            >
                              {isUserActionLoading(user.id, "ban") ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.is_banned ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteUser(user.id, user.username)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete user"
                              disabled={isUserActionLoading(user.id, "delete")}
                            >
                              {isUserActionLoading(user.id, "delete") ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {currentUsers.length === 0 && !usersLoading && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No users found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchTerm || filterStatus !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : selectedApp
                          ? "Create your first user to get started"
                          : "Select an application to view users"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !usersLoading && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-yellow-500 text-black hover:bg-yellow-600"
                            : "border-gray-600 text-gray-300 hover:bg-gray-800"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </ModernCard>

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
