import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { public_key, secret_key, username, password, license_key, hwid } = await request.json()

    
    if (!username || !password || !license_key) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, password, and license key are required",
        },
        { status: 400 },
      )
    }

    
    const apps = await query(
      'SELECT id, hwid_lock FROM applications WHERE public_key = ? AND secret_key = ? AND status = "active"',
      [public_key, secret_key],
    )

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application keys",
        },
        { status: 401 },
      )
    }

    const app = apps[0] as any

    
    const licenses = await query(
      "SELECT * FROM licenses WHERE application_id = ? AND license_key = ? AND is_banned = FALSE",
      [app.id, license_key],
    )

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid license key",
        },
        { status: 401 },
      )
    }

    const license = licenses[0] as any

    
    if (license.username) {
      return NextResponse.json(
        {
          success: false,
          message: "License key already in use",
        },
        { status: 409 },
      )
    }

    
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "License key has expired",
        },
        { status: 401 },
      )
    }

    
    const existingUsers = await query(
      "SELECT id FROM licenses WHERE application_id = ? AND username = ?",
      [app.id, username],
    )

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 409 },
      )
    }

    
    if (app.hwid_lock && !hwid) {
      return NextResponse.json(
        {
          success: false,
          message: "HWID required for this application",
        },
        { status: 400 },
      )
    }

    
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    
    const updateData = [username, password_hash, app.hwid_lock ? hwid : null, license.id]
    await query(
      "UPDATE licenses SET username = ?, password_hash = ?, hwid = ? WHERE id = ?",
      updateData,
    )

    
    await query(
      "INSERT INTO logs (application_id, username, action, ip_address) VALUES (?, ?, ?, ?)",
      [app.id, username, "register", request.ip || "unknown"],
    )

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        username: username,
        subscription: license.subscription_type,
        expires_at: license.expires_at,
      },
    })
  } catch (error) {
    console.error("API Register error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
