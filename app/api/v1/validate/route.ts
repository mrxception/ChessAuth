import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// Define interfaces for type safety
interface ValidateRequest {
  public_key: string
  secret_key: string
  username: string
  hwid?: string
}

interface Application {
  id: number
  hwid_lock: boolean
}

interface License {
  id: number
  username: string
  subscription_type: string
  expires_at: string | null
  hwid: string | null
  is_banned: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequest
    const { public_key, secret_key, username, hwid } = body

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
      "SELECT * FROM licenses WHERE application_id = ? AND username = ? AND is_banned = FALSE",
      [app.id, username],
    )) as License[]

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      )
    }

    const license = licenses[0]

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription expired",
        },
        { status: 401 },
      )
    }

    if (app.hwid_lock && license.hwid && license.hwid !== hwid) {
      return NextResponse.json(
        {
          success: false,
          message: "HWID mismatch",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Validation successful",
      data: {
        username: license.username,
        subscription: license.subscription_type,
        expires_at: license.expires_at,
        hwid: license.hwid,
      },
    })
  } catch (error: unknown) {
    console.error("API Validate error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
