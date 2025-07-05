import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { public_key, secret_key, username, hwid } = await request.json()

    
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
      "SELECT * FROM licenses WHERE application_id = ? AND username = ? AND is_banned = FALSE",
      [app.id, username],
    )

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      )
    }

    const license = licenses[0] as any

    
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
  } catch (error) {
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
