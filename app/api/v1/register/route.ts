import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

// Define interfaces for type safety
interface RegisterRequest {
  public_key: string
  secret_key: string
  username: string
  password: string
  license_key: string
  hwid?: string
}

interface Application {
  id: number
  hwid_lock: boolean
}

interface License {
  id: number
  username: string | null
  password_hash: string | null
  license_key: string
  expires_at: string | null
  subscription_type: string
  is_banned: boolean
  hwid: string | null
}

interface ExistingUser {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterRequest
    const { public_key, secret_key, username, password, license_key, hwid } = body

    if (!username || !password || !license_key) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, password, and license key are required",
        },
        { status: 400 },
      )
    }

    const apps = (await query(
      'SELECT id, hwid_lock FROM applications WHERE public_key = ? AND secret_key = ? AND status = "active"',
      [public_key, secret_key],
    )) as Application[]

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application keys",
        },
        { status: 401 },
      )
    }

    const app = apps[0]

    const licenses = (await query(
      "SELECT * FROM licenses WHERE application_id = ? AND license_key = ? AND is_banned = FALSE",
      [app.id, license_key],
    )) as License[]

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid license key",
        },
        { status: 401 },
      )
    }

    const license = licenses[0]

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

    const existingUsers = (await query("SELECT id FROM licenses WHERE application_id = ? AND username = ?", [
      app.id,
      username,
    ])) as ExistingUser[]

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

    const updateData: (string | null | number)[] = [username, password_hash, app.hwid_lock ? hwid : null, license.id]
    await query("UPDATE licenses SET username = ?, password_hash = ?, hwid = ? WHERE id = ?", updateData)

    await query("INSERT INTO logs (application_id, username, action, ip_address) VALUES (?, ?, ?, ?)", [
      app.id,
      username,
      "register",
      request.ip || "unknown",
    ])

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        username: username,
        subscription: license.subscription_type,
        expires_at: license.expires_at,
      },
    })
  } catch (error: unknown) {
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
