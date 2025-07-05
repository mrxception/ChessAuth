import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const licenses = await query(`
      SELECT 
        l.id,
        l.license_key,
        l.username,
        l.subscription_type,
        l.expires_at,
        l.is_banned,
        l.created_at,
        a.app_name,
        u.username as owner_username
      FROM licenses l
      JOIN applications a ON l.application_id = a.id
      JOIN users u ON a.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 1000
    `)

    return NextResponse.json({
      success: true,
      licenses,
    })
  } catch (error) {
    console.error("Admin licenses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
