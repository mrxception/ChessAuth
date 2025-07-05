import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken, generateKey } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id: appId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    const users = await query(
      `SELECT l.id, l.username, l.license_key, l.subscription_type, l.expires_at, l.is_banned,
        l.hwid, l.created_at 
       FROM licenses l 
       WHERE l.application_id = ? AND l.username IS NOT NULL AND l.username != '' 
       ORDER BY l.created_at DESC`,
      [appId],
    )

    return NextResponse.json({
      success: true,
      users: users || [],
    })
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { username, password, subscription_type, expires_at } = await request.json()
    const { id: appId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    const existingUsers = await query(
      "SELECT id FROM licenses WHERE application_id = ? AND username = ? AND username IS NOT NULL",
      [appId, username],
    )

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    const licenseKey = generateKey("lic")

    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    await query(
      "INSERT INTO licenses (application_id, license_key, username, password_hash, subscription_type, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
      [appId, licenseKey, username, password_hash, subscription_type, expires_at],
    )

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
