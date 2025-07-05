import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  try {
    const { public_key, secret_key, username, password, hwid } = await request.json()

    
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
        { status: 401, headers: corsHeaders() },
      )
    }

    const app = apps[0] as any

    
    let settings = await query("SELECT * FROM app_settings WHERE application_id = ?", [app.id])

    
    if (!Array.isArray(settings) || settings.length === 0) {
      await query("INSERT INTO app_settings (application_id) VALUES (?)", [app.id])
      settings = await query("SELECT * FROM app_settings WHERE application_id = ?", [app.id])
    }

    const appSettings = Array.isArray(settings) && settings.length > 0 ? settings[0] : null

    
    const messages = {
      login_success: appSettings?.login_success_msg || "Login successful",
      login_error: appSettings?.login_error_msg || "Invalid credentials",
      sub_expired: appSettings?.sub_expired_msg || "Subscription expired",
      banned: appSettings?.banned_msg || "Account banned",
      hwid_mismatch: appSettings?.hwid_mismatch_msg || "HWID mismatch",
    }

    
    const licenses = await query("SELECT * FROM licenses WHERE application_id = ? AND username = ?", [app.id, username])

    if (!Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: messages.login_error,
        },
        { status: 401, headers: corsHeaders() },
      )
    }

    const license = licenses[0] as any

    
    if (license.is_banned) {
      return NextResponse.json(
        {
          success: false,
          message: messages.banned,
        },
        { status: 401, headers: corsHeaders() },
      )
    }

    
    if (!license.password_hash || !password) {
      return NextResponse.json(
        {
          success: false,
          message: messages.login_error,
        },
        { status: 401, headers: corsHeaders() },
      )
    }

    const passwordValid = await bcrypt.compare(password, license.password_hash)
    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: messages.login_error,
        },
        { status: 401, headers: corsHeaders() },
      )
    }

    
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: messages.sub_expired,
        },
        { status: 401, headers: corsHeaders() },
      )
    }

    
    if (app.hwid_lock) {
      if (!hwid) {
        return NextResponse.json(
          {
            success: false,
            message: "HWID required",
          },
          { status: 400, headers: corsHeaders() },
        )
      }

      if (license.hwid && license.hwid !== hwid) {
        return NextResponse.json(
          {
            success: false,
            message: messages.hwid_mismatch,
          },
          { status: 401, headers: corsHeaders() },
        )
      }

      
      if (!license.hwid) {
        await query("UPDATE licenses SET hwid = ? WHERE id = ?", [hwid, license.id])
      }
    }

    
    await query("INSERT INTO logs (application_id, username, action, ip_address) VALUES (?, ?, ?, ?)", [
      app.id,
      username,
      "login",
      request.ip || "unknown",
    ])

    return NextResponse.json(
      {
        success: true,
        message: messages.login_success,
        data: {
          username: license.username,
          subscription: license.subscription_type,
          expires_at: license.expires_at,
        },
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error("API Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500, headers: corsHeaders() },
    )
  }
}
