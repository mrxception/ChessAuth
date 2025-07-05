"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface LogInterface {
  id: number
  username: string | null
  action: string
  timestamp: string
}

type SortField = "username" | "action" | "timestamp"
type SortDirection = "asc" | "desc"

export default function LogsPage() {
  const [logs, setLogs] = useState<LogInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [applications, setApplications] = useState<any[]>([])
  const [selectedApp, setSelectedApp] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedLog, setSelectedLog] = useState<LogInterface | null>(null)
  const [showLogDetails, setShowLogDetails] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchApplications()
  }, [])

  useEffect(() => {
    if (selectedApp) {
      fetchLogs()
    }
  }, [selectedApp, currentPage, searchTerm, selectedAction, dateFrom, dateTo])

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

  const fetchLogs = async () => {
    if (!selectedApp) return

    setLogsLoading(true)
    setError("")
    const token = localStorage.getItem("token")

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      if (searchTerm) params.append("search", searchTerm)
      if (selectedAction) params.append("action", selectedAction)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/applications/${selectedApp}/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setTotalLogs(data.total || 0)
        setAvailableActions(data.actions || [])
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      setError("Failed to fetch logs")
    } finally {
      setLogsLoading(false)
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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAction("")
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
  }

  const openLogDetails = (log: LogInterface) => {
    setSelectedLog(log)
    setShowLogDetails(true)
  }

  const getActionBadge = (action: string) => {
    const actionColors: { [key: string]: string } = {
      login: "bg-green-500/20 text-green-400 border-green-500/50",
      logout: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      login_failed: "bg-red-500/20 text-red-400 border-red-500/50",
      register: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      password_change: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      license_check: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      ban: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      unban: "bg-lime-500/20 text-lime-400 border-lime-500/50",
    }
    const colorClass = actionColors[action] || "bg-gray-500/20 text-gray-400 border-gray-500/50"
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${colorClass}`}>
        {action.replace(/_/g, " ").toUpperCase()}
      </span>
    )
  }

  
  const sortedLogs = [...logs].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]
    if (aValue === null) aValue = ""
    if (bValue === null) bValue = ""
    if (sortField === "timestamp") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (loading) {
    return (
      <ModernLayout showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
            <p className="text-gray-400">Loading logs...</p>
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
              <Activity className="mr-3 h-8 w-8" />
              Activity Logs
            </h1>
            <p className="text-gray-400 mt-1">Monitor system activity and user actions</p>
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

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Filters */}
        <ModernCard>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="appearance-none w-full px-3 py-2 pr-8 bg-gray-800/80 border border-gray-600 text-white rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">
                    All Actions
                  </option>
                  {availableActions.map((action) => (
                    <option key={action} value={action} className="bg-gray-800">
                      {action.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="From date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="To date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white"
                />
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </ModernCard>

        {/* Log Details Modal */}
        {showLogDetails && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Log Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Timestamp
                    </Label>
                    <p className="text-white font-mono text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Action</Label>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Username
                    </Label>
                    <p className="text-white">{selectedLog.username || "N/A"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogDetails(false)}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Logs Table */}
        <ModernCard>
          <CardHeader>
            <CardTitle className="gradient-text">
              Activity Logs ({totalLogs}) - Page {currentPage} of {totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th
                      className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Timestamp</span>
                        {getSortIcon("timestamp")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("action")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Action</span>
                        {getSortIcon("action")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Username</span>
                        {getSortIcon("username")}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                          <p className="text-gray-400">Loading logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : sortedLogs.length > 0 ? (
                    
                    sortedLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                        <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                        <td className="py-3 px-4 text-white">{log.username || "N/A"}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openLogDetails(log)}
                            className="text-blue-400 hover:text-blue-300"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !logsLoading && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalLogs)} of{" "}
                  {totalLogs} logs
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || logsLoading}
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
                        disabled={logsLoading}
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
                    disabled={currentPage === totalPages || logsLoading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </ModernCard>
      </div>
    </ModernLayout>
  )
}
