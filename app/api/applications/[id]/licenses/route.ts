import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.substring(7) 
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id: appId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    const licenses = await query(
      `SELECT l.*,
        CASE WHEN l.username IS NOT NULL THEN 1 ELSE 0 END as is_used,
       l.created_at as used_at 
       FROM licenses l 
       WHERE l.application_id = ? 
       ORDER BY l.created_at DESC`,
      [appId],
    )

    return NextResponse.json({
      success: true,
      licenses: licenses || [],
    })
  } catch (error) {
    console.error("Fetch licenses error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.substring(7) 
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { licenses } = await request.json()
    const { id: appId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    for (const license of licenses) {
      await query(
        "INSERT INTO licenses (application_id, license_key, subscription_type, expires_at) VALUES (?, ?, ?, ?)",
        [appId, license.license_key, license.subscription_type, license.expires_at],
      )
    }

    return NextResponse.json({
      success: true,
      message: `${licenses.length} license${licenses.length > 1 ? "s" : ""} created successfully`,
    })
  } catch (error) {
    console.error("Create licenses error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
