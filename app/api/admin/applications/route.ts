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

    const applications = await query(`
      SELECT 
        a.id,
        a.app_name,
        a.status,
        a.hwid_lock,
        a.created_at,
        u.username as owner_username,
        u.email as owner_email,
        (SELECT COUNT(*) FROM licenses l WHERE l.application_id = a.id AND l.username IS NOT NULL AND l.username != '') as user_count,
        (SELECT COUNT(*) FROM licenses l WHERE l.application_id = a.id) as license_count
      FROM applications a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Admin applications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
