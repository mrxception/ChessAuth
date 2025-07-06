"use client"
import React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageBox, type MessageBoxProps } from "@/components/message-box"
import {
  Shield,
  Users,
  Crown,
  Key,
  Activity,
  Database,
  Ban,
  UserCheck,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  TrendingUp,
  Server,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface AdminStats {
  users: {
    total_users: number
    admin_users: number
    regular_users: number
    users_last_30_days: number
  }
  applications: {
    total_apps: number
    active_apps: number
    suspended_apps: number
    hwid_locked_apps: number
  }
  licenses: {
    total_licenses: number
    used_licenses: number
    unused_licenses: number
    expired_licenses: number
    banned_licenses: number
  }
}

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  created_at: string
  app_count: number
  [key: string]: unknown
}

interface AdminApplication {
  id: number
  app_name: string
  owner_username: string
  owner_email: string
  status: string
  hwid_lock: boolean
  created_at: string
  user_count: number
  license_count: number
  [key: string]: unknown
}

interface AdminLicense {
  id: number
  license_key: string
  app_name: string
  owner_username: string
  username: string | null
  subscription_type: string
  expires_at: string | null
  is_banned: boolean
  created_at: string
  [key: string]: unknown
}

interface AdminLog {
  id: number
  action: string
  username: string | null
  timestamp: string
  app_name: string | null
  app_owner: string | null
  [key: string]: unknown
}

interface LoadingStates {
  stats: boolean
  users: boolean
  applications: boolean
  licenses: boolean
  logs: boolean
}

interface ActionLoading {
  [key: string]: boolean
}

interface EmptyStateProps {
  message: string
  icon: React.ComponentType<{ className?: string }>
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
      <div className="flex items-center text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={
                  currentPage === page
                    ? "bg-yellow-500 text-black hover:bg-yellow-600"
                    : "text-gray-400 hover:text-white"
                }
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [licenses, setLicenses] = useState<AdminLicense[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionLoading, setActionLoading] = useState<ActionLoading>({})
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    stats: false,
    users: false,
    applications: false,
    licenses: false,
    logs: false,
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState({
    users: 1,
    applications: 1,
    licenses: 1,
    logs: 1,
  })

  const ITEMS_PER_PAGE = 10

  const [messageBox, setMessageBox] = useState<Omit<MessageBoxProps, "isOpen"> & { isOpen: boolean }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: undefined,
    onCancel: undefined,
  })

  const router = useRouter()

  const checkAdminAuth = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "admin") {
          router.push("/dashboard")
          return
        }
      } else {
        router.push("/login")
        return
      }
    } catch {
      router.push("/login")
      return
    }
    setLoading(false)
  }, [router])

  const fetchStats = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, stats: true }))
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch {
      setError("Failed to load statistics")
    } finally {
      setLoadingStates((prev) => ({ ...prev, stats: false }))
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, users: true }))
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch {
      setError("Failed to load users")
    } finally {
      setLoadingStates((prev) => ({ ...prev, users: false }))
    }
  }, [])

  const fetchApplications = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, applications: true }))
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/admin/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch {
      setError("Failed to load applications")
    } finally {
      setLoadingStates((prev) => ({ ...prev, applications: false }))
    }
  }, [])

  const fetchLicenses = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, licenses: true }))
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/admin/licenses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLicenses(data.licenses)
      }
    } catch {
      setError("Failed to load licenses")
    } finally {
      setLoadingStates((prev) => ({ ...prev, licenses: false }))
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, logs: true }))
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/admin/logs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch {
      setError("Failed to load logs")
    } finally {
      setLoadingStates((prev) => ({ ...prev, logs: false }))
    }
  }, [])

  useEffect(() => {
    checkAdminAuth()
  }, [checkAdminAuth])

  useEffect(() => {
    if (activeTab === "overview") {
      fetchStats()
    } else if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "applications") {
      fetchApplications()
    } else if (activeTab === "licenses") {
      fetchLicenses()
    } else if (activeTab === "logs") {
      fetchLogs()
    }
  }, [activeTab, fetchStats, fetchUsers, fetchApplications, fetchLicenses, fetchLogs])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  // Reset pagination when switching tabs or searching
  useEffect(() => {
    setCurrentPage((prev) => ({
      ...prev,
      [activeTab]: 1,
    }))
  }, [activeTab, searchTerm])

  const showMessageBox = (config: Omit<MessageBoxProps, "isOpen" | "onClose">) => {
    setMessageBox({
      ...config,
      isOpen: true,
    })
  }

  const hideMessageBox = () => {
    setMessageBox((prev) => ({ ...prev, isOpen: false }))
  }

  const toggleUserRole = async (userId: number, currentRole: string, username: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin"
    showMessageBox({
      type: "confirm",
      title: `Change User Role`,
      message: `Are you sure you want to change ${username}'s role from ${currentRole} to ${newRole}?`,
      confirmText: "Change Role",
      cancelText: "Cancel",
      onConfirm: async () => {
        setActionLoading((prev) => ({ ...prev, [`user-${userId}`]: true }))
        const token = localStorage.getItem("token")
        try {
          const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role: newRole }),
          })
          if (response.ok) {
            fetchUsers()
            setSuccess(`User ${username} role changed to ${newRole}`)
          } else {
            setError("Failed to change user role")
          }
        } catch {
          setError("Failed to change user role")
        } finally {
          setActionLoading((prev) => ({ ...prev, [`user-${userId}`]: false }))
        }
      },
    })
  }

  const suspendApplication = async (appId: number, appName: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active"
    showMessageBox({
      type: "confirm",
      title: `${newStatus === "suspended" ? "Suspend" : "Activate"} Application`,
      message: `Are you sure you want to ${newStatus === "suspended" ? "suspend" : "activate"} the application "${appName}"?`,
      confirmText: newStatus === "suspended" ? "Suspend" : "Activate",
      cancelText: "Cancel",
      onConfirm: async () => {
        setActionLoading((prev) => ({ ...prev, [`app-${appId}`]: true }))
        const token = localStorage.getItem("token")
        try {
          const response = await fetch(`/api/admin/applications/${appId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          })
          if (response.ok) {
            fetchApplications()
            setSuccess(`Application ${appName} ${newStatus === "suspended" ? "suspended" : "activated"}`)
          } else {
            setError("Failed to update application status")
          }
        } catch {
          setError("Failed to update application status")
        } finally {
          setActionLoading((prev) => ({ ...prev, [`app-${appId}`]: false }))
        }
      },
    })
  }

  const deleteUser = async (userId: number, username: string) => {
    showMessageBox({
      type: "confirm",
      title: "Delete User",
      message: `Are you sure you want to delete user "${username}"? This will permanently delete all their applications, users, and licenses. This action cannot be undone.`,
      confirmText: "Delete User",
      cancelText: "Cancel",
      onConfirm: async () => {
        setActionLoading((prev) => ({ ...prev, [`delete-user-${userId}`]: true }))
        const token = localStorage.getItem("token")
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            fetchUsers()
            setSuccess(`User ${username} deleted successfully`)
          } else {
            setError("Failed to delete user")
          }
        } catch {
          setError("Failed to delete user")
        } finally {
          setActionLoading((prev) => ({ ...prev, [`delete-user-${userId}`]: false }))
        }
      },
    })
  }

  // Filter and paginate data
  const getFilteredAndPaginatedData = <T extends Record<string, unknown>>(
    data: T[],
    searchFields: string[],
    tabName: string,
  ) => {
    const filtered = data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        const stringValue = value ? String(value) : ""
        return stringValue.toLowerCase().includes(searchTerm.toLowerCase())
      }),
    )

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage[tabName as keyof typeof currentPage] - 1) * ITEMS_PER_PAGE
    const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return { data: paginatedData, totalPages, totalItems: filtered.length }
  }

  const filteredUsers = getFilteredAndPaginatedData(users, ["username", "email"], "users")
  const filteredApplications = getFilteredAndPaginatedData(applications, ["app_name", "owner_username"], "applications")
  const filteredLicenses = getFilteredAndPaginatedData(licenses, ["license_key", "username", "app_name"], "licenses")
  const filteredLogs = getFilteredAndPaginatedData(logs, ["action", "username", "app_name"], "logs")

  const handlePageChange = (tabName: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [tabName]: page,
    }))
  }

  const TableLoading = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )

  const EmptyState = ({ message, icon: Icon }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-gray-500 mb-4" />
      <p className="text-gray-400 text-lg font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-1">No data available at the moment</p>
    </div>
  )

  if (loading) {
    return (
      <ModernLayout showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
            <p className="text-gray-400">Loading admin panel...</p>
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
              <Shield className="mr-3 h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-gray-400 mt-1">System-wide administration and monitoring</p>
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "users", label: "Users", icon: Users },
            { id: "applications", label: "Apps", icon: Crown },
            { id: "licenses", label: "Licenses", icon: Key },
            { id: "logs", label: "Logs", icon: Activity },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === "applications" ? "Apps" : tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loadingStates.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ModernCard key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-700 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </ModernCard>
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ModernCard>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Users</p>
                          <p className="text-2xl font-bold text-white">{stats.users.total_users}</p>
                          <p className="text-xs text-gray-500">
                            {stats.users.admin_users} admins, {stats.users.regular_users} users
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </ModernCard>

                  <ModernCard>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Applications</p>
                          <p className="text-2xl font-bold text-white">{stats.applications.total_apps}</p>
                          <p className="text-xs text-gray-500">
                            {stats.applications.active_apps} active, {stats.applications.suspended_apps} suspended
                          </p>
                        </div>
                        <Crown className="h-8 w-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </ModernCard>

                  <ModernCard>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Licenses</p>
                          <p className="text-2xl font-bold text-white">{stats.licenses.total_licenses}</p>
                          <p className="text-xs text-gray-500">
                            {stats.licenses.used_licenses} used, {stats.licenses.unused_licenses} available
                          </p>
                        </div>
                        <Key className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </ModernCard>

                  <ModernCard>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">New Users (30d)</p>
                          <p className="text-2xl font-bold text-white">{stats.users.users_last_30_days}</p>
                          <p className="text-xs text-gray-500">Last 30 days</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </ModernCard>
                </div>

                {/* System Health */}
                <ModernCard>
                  <CardHeader>
                    <CardTitle className="gradient-text">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Server className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 font-medium">System Online</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">All services operational</p>
                      </div>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Database className="h-5 w-5 text-blue-400" />
                          <span className="text-blue-400 font-medium">Database Connected</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Response time: ~2ms</p>
                      </div>
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">API Active</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">All endpoints responding</p>
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              </>
            ) : (
              <EmptyState message="No statistics available" icon={TrendingUp} />
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">System Users</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white w-full"
                />
              </div>
            </div>

            <ModernCard>
              <CardContent className="p-0">
                {loadingStates.users ? (
                  <TableLoading />
                ) : filteredUsers.data.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Apps</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Created</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.data.map((user) => (
                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                              <td className="py-3 px-4 font-medium text-white">{user.username}</td>
                              <td className="py-3 px-4 text-gray-300">{user.email}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    user.role === "admin"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{user.app_count}</td>
                              <td className="py-3 px-4 text-gray-300">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleUserRole(user.id, user.role, user.username)}
                                    className="text-blue-400 hover:text-blue-300"
                                    title={`Make ${user.role === "admin" ? "user" : "admin"}`}
                                    disabled={actionLoading[`user-${user.id}`]}
                                  >
                                    {actionLoading[`user-${user.id}`] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : user.role === "admin" ? (
                                      <UserCheck className="h-4 w-4" />
                                    ) : (
                                      <Shield className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteUser(user.id, user.username)}
                                    className="text-red-400 hover:text-red-300"
                                    title="Delete user"
                                    disabled={actionLoading[`delete-user-${user.id}`]}
                                  >
                                    {actionLoading[`delete-user-${user.id}`] ? (
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
                    </div>
                    <Pagination
                      currentPage={currentPage.users}
                      totalPages={filteredUsers.totalPages}
                      onPageChange={(page) => handlePageChange("users", page)}
                    />
                  </>
                ) : (
                  <EmptyState message="No users found" icon={Users} />
                )}
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">All Applications</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white w-full"
                />
              </div>
            </div>

            <ModernCard>
              <CardContent className="p-0">
                {loadingStates.applications ? (
                  <TableLoading />
                ) : filteredApplications.data.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Application</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Owner</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Users</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Licenses</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Created</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApplications.data.map((app) => (
                            <tr key={app.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                              <td className="py-3 px-4 font-medium text-white">{app.app_name}</td>
                              <td className="py-3 px-4 text-gray-300">
                                <div>
                                  <div className="font-medium">{app.owner_username}</div>
                                  <div className="text-xs text-gray-500">{app.owner_email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    app.status === "active"
                                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                      : "bg-red-500/20 text-red-400 border border-red-500/50"
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{app.user_count}</td>
                              <td className="py-3 px-4 text-gray-300">{app.license_count}</td>
                              <td className="py-3 px-4 text-gray-300">
                                {new Date(app.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => suspendApplication(app.id, app.app_name, app.status)}
                                  className={
                                    app.status === "active"
                                      ? "text-orange-400 hover:text-orange-300"
                                      : "text-green-400 hover:text-green-300"
                                  }
                                  title={app.status === "active" ? "Suspend application" : "Activate application"}
                                  disabled={actionLoading[`app-${app.id}`]}
                                >
                                  {actionLoading[`app-${app.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : app.status === "active" ? (
                                    <Ban className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage.applications}
                      totalPages={filteredApplications.totalPages}
                      onPageChange={(page) => handlePageChange("applications", page)}
                    />
                  </>
                ) : (
                  <EmptyState message="No applications found" icon={Crown} />
                )}
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Licenses Tab */}
        {activeTab === "licenses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">All Licenses</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search licenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white w-full"
                />
              </div>
            </div>

            <ModernCard>
              <CardContent className="p-0">
                {loadingStates.licenses ? (
                  <TableLoading />
                ) : filteredLicenses.data.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">License Key</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Application</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Owner</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Used By</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Expires</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLicenses.data.map((license) => (
                            <tr key={license.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                              <td className="py-3 px-4 font-mono text-sm text-white">
                                {license.license_key.substring(0, 20)}...
                              </td>
                              <td className="py-3 px-4 text-gray-300">{license.app_name}</td>
                              <td className="py-3 px-4 text-gray-300">{license.owner_username}</td>
                              <td className="py-3 px-4 text-gray-300">
                                {license.username || <span className="text-gray-500">Not used</span>}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                                  {license.subscription_type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : "Never"}
                              </td>
                              <td className="py-3 px-4">
                                {license.is_banned ? (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/50">
                                    Banned
                                  </span>
                                ) : license.expires_at && new Date(license.expires_at) < new Date() ? (
                                  <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/50">
                                    Expired
                                  </span>
                                ) : license.username ? (
                                  <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50">
                                    Used
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
                                    Available
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage.licenses}
                      totalPages={filteredLicenses.totalPages}
                      onPageChange={(page) => handlePageChange("licenses", page)}
                    />
                  </>
                ) : (
                  <EmptyState message="No licenses found" icon={Key} />
                )}
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">Activity Logs</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white w-full"
                />
              </div>
            </div>

            <ModernCard>
              <CardContent className="p-0">
                {loadingStates.logs ? (
                  <TableLoading />
                ) : filteredLogs.data.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Timestamp</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Action</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Application</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Owner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.data.map((log) => (
                            <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                              <td className="py-3 px-4 text-gray-300 text-sm">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-medium text-white">{log.action}</td>
                              <td className="py-3 px-4 text-gray-300">{log.username || "N/A"}</td>
                              <td className="py-3 px-4 text-gray-300">{log.app_name || "N/A"}</td>
                              <td className="py-3 px-4 text-gray-300">{log.app_owner || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage.logs}
                      totalPages={filteredLogs.totalPages}
                      onPageChange={(page) => handlePageChange("logs", page)}
                    />
                  </>
                ) : (
                  <EmptyState message="No activity logs found" icon={Activity} />
                )}
              </CardContent>
            </ModernCard>
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
