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

    const logs = await query(`
      SELECT 
        l.id,
        l.action,
        l.username,
        l.ip_address,
        l.timestamp,
        a.app_name,
        u.username as app_owner
      FROM logs l
      LEFT JOIN applications a ON l.application_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY l.timestamp DESC
      LIMIT 100
    `)

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error("Admin logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
