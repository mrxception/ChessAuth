import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    // Check if authHeader exists and starts with "Bearer "
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.substring(7) // This is now guaranteed to be a string
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const users = await query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(a.id) as app_count
      FROM users u
      LEFT JOIN applications a ON u.id = a.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.username, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}