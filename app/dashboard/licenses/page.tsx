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
import { MessageBox, type MessageBoxProps } from "@/components/message-box"
import {
  Plus,
  Key,
  Calendar,
  Copy,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react"

interface License {
  id: number
  license_key: string
  username: string | null
  subscription_type: string
  expires_at: string | null
  is_used: boolean
  hwid: string | null
  created_at: string
}

type SortField = "license_key" | "username" | "subscription_type" | "expires_at" | "created_at"
type SortDirection = "asc" | "desc"

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [applications, setApplications] = useState<any[]>([])
  const [selectedApp, setSelectedApp] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [formData, setFormData] = useState({
    format: "CHESS-***-***",
    subscription_type: "free",
    expires_at: "",
    duration_days: "",
    quantity: "1",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [licensesLoading, setLicensesLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  
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
      fetchLicenses()
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
        if (data.applications.length > 0) {
          setSelectedApp(data.applications[0].id.toString())
        }
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    }
  }

  const fetchLicenses = async () => {
    if (!selectedApp) return
    setLicensesLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/applications/${selectedApp}/licenses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLicenses(data.licenses || [])
      } else {
        setError("Failed to load licenses")
      }
    } catch (error) {
      console.error("Failed to fetch licenses:", error)
      setError("Failed to load licenses")
    } finally {
      setLicensesLoading(false)
    }
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

  const generateLicenseKey = (format: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return format.replace(/\*/g, () => chars.charAt(Math.floor(Math.random() * chars.length)))
  }

  const createLicenses = async (e: React.FormEvent) => {
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

    const quantity = Number.parseInt(formData.quantity)
    const licenses = []
    for (let i = 0; i < quantity; i++) {
      licenses.push({
        license_key: generateLicenseKey(formData.format),
        subscription_type: formData.subscription_type,
        expires_at: expiresAt,
      })
    }

    try {
      const response = await fetch(`/api/applications/${selectedApp}/licenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ licenses }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(`${quantity} license${quantity > 1 ? "s" : ""} created successfully!`)
        setFormData({
          format: "CHESS-***-***",
          subscription_type: "free",
          expires_at: "",
          duration_days: "",
          quantity: "1",
        })
        setShowCreateForm(false)
        fetchLicenses()
      } else {
        setError(data.message || "Failed to create licenses")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setCreateLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("License key copied to clipboard!")
  }

  const setLicenseActionLoading = (licenseId: number, action: string, loading: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [`${licenseId}-${action}`]: loading,
    }))
  }

  const isLicenseActionLoading = (licenseId: number, action: string) => {
    return actionLoading[`${licenseId}-${action}`] || false
  }

  const deleteLicense = async (licenseId: number, licenseKey: string) => {
    showMessageBox({
      type: "confirm",
      title: "Delete License",
      message: `Are you sure you want to delete license "${licenseKey}"? This action cannot be undone and will permanently remove the license.`,
      confirmText: "Delete License",
      cancelText: "Cancel",
      onConfirm: async () => {
        setLicenseActionLoading(licenseId, "delete", true)
        const token = localStorage.getItem("token")
        try {
          const response = await fetch(`/api/applications/${selectedApp}/licenses/${licenseId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            fetchLicenses()
            setSuccess("License deleted successfully!")
          } else {
            setError("Failed to delete license")
          }
        } catch (error) {
          setError("Failed to delete license")
        } finally {
          setLicenseActionLoading(licenseId, "delete", false)
        }
      },
    })
  }

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.license_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (license.username && license.username.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "used" && license.username !== null && license.username !== "") ||
      (filterStatus === "unused" && (license.username === null || license.username === "")) ||
      (filterStatus === "expired" && license.expires_at && new Date(license.expires_at) < new Date())

    return matchesSearch && matchesFilter
  })

  
  const sortedLicenses = [...filteredLicenses].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    
    if (aValue === null) aValue = ""
    if (bValue === null) bValue = ""

    
    if (sortField === "expires_at" || sortField === "created_at") {
      aValue = aValue ? new Date(aValue).getTime() : 0
      bValue = bValue ? new Date(bValue).getTime() : 0
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  
  const totalPages = Math.ceil(sortedLicenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLicenses = sortedLicenses.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getStatusBadge = (license: License) => {
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/50">
          Expired
        </span>
      )
    }
    if (license.username && license.username !== "") {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50">
          Used
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
        Available
      </span>
    )
  }

  if (loading) {
    return (
      <ModernLayout showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-400">Loading licenses...</p>
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
              <Key className="mr-3 h-8 w-8" />
              License Management
            </h1>
            <p className="text-gray-400 mt-1">Generate and manage license keys for your applications</p>
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
              Generate Licenses
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

        {/* Create License Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="gradient-text">Generate New Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createLicenses} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">License Format</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="format"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="pl-10 bg-black/20 border-gray-600 text-white font-mono"
                        placeholder="CHESS-***-***"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Use * for random characters. Example: CHESS-***-*** becomes CHESS-A1B-2C3
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subscription">Subscription Type</Label>
                      <select
                        value={formData.subscription_type}
                        onChange={(e) => setFormData({ ...formData, subscription_type: e.target.value })}
                        className="appearance-none w-full px-3 py-2 pr-8 bg-gray-800/80 border border-gray-600 text-white rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 backdrop-blur-sm"
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
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white"
                        required
                      />
                    </div>
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
                      />
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>Tip:</strong> You can generate up to 100 licenses at once. Each license will have a
                      unique key based on your format.
                    </p>
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
                          <span>Generating...</span>
                        </div>
                      ) : (
                        `Generate ${formData.quantity} License${Number.parseInt(formData.quantity) > 1 ? "s" : ""}`
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-gray-600 text-gray-300"
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
                  placeholder="Search licenses or usernames..."
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
                    All Licenses
                  </option>
                  <option value="unused" className="bg-gray-800">
                    Available
                  </option>
                  <option value="used" className="bg-gray-800">
                    Used
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

        {/* Licenses Table */}
        <ModernCard>
          <CardHeader>
            <CardTitle className="gradient-text">
              Licenses ({filteredLicenses.length}) - Page {currentPage} of {totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {licensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
                  <p className="text-gray-400">Loading licenses...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("license_key")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>License Key</span>
                          {getSortIcon("license_key")}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("username")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Used By</span>
                          {getSortIcon("username")}
                        </div>
                      </th>
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
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th
                        className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort("created_at")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {getSortIcon("created_at")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLicenses.map((license) => (
                      <tr key={license.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-mono text-sm text-white">{license.license_key}</td>
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
                        <td className="py-3 px-4">{getStatusBadge(license)}</td>
                        <td className="py-3 px-4 text-gray-300">{new Date(license.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(license.license_key)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Copy license key"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteLicense(license.id, license.license_key)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete license"
                              disabled={isLicenseActionLoading(license.id, "delete")}
                            >
                              {isLicenseActionLoading(license.id, "delete") ? (
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
                {currentLicenses.length === 0 && !licensesLoading && (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No licenses found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchTerm || filterStatus !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : selectedApp
                          ? "Generate your first license to get started"
                          : "Select an application to view licenses"}
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && !licensesLoading && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLicenses.length)} of {filteredLicenses.length}{" "}
                  licenses
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
