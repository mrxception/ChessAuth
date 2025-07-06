import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// Define interfaces for the stats results
interface UserStats {
  total_users: number
  admin_users: number
  regular_users: number
  users_last_30_days: number
}

interface AppStats {
  total_apps: number
  active_apps: number
  suspended_apps: number
  hwid_locked_apps: number
}

interface LicenseStats {
  total_licenses: number
  used_licenses: number
  unused_licenses: number
  expired_licenses: number
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    // Check if authHeader exists and starts with "Bearer "
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as users_last_30_days
      FROM users
    `) as UserStats[]

    const appStats = await query(`
      SELECT 
        COUNT(*) as total_apps,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_apps,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_apps,
        COUNT(CASE WHEN hwid_lock = TRUE THEN 1 END) as hwid_locked_apps
      FROM applications
    `) as AppStats[]

    const licenseStats = await query(`
      SELECT 
        COUNT(*) as total_licenses,
        COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as used_licenses,
        COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as unused_licenses,
        COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 END) as expired_licenses
      FROM licenses
    `) as LicenseStats[]

    return NextResponse.json({
      success: true,
      stats: {
        users: userStats[0],
        applications: appStats[0],
        licenses: licenseStats[0],
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}