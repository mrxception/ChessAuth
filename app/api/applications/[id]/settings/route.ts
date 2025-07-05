import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    let settings = await query("SELECT * FROM app_settings WHERE application_id = ?", [appId])

    if (!Array.isArray(settings) || settings.length === 0) {
      await query("INSERT INTO app_settings (application_id) VALUES (?)", [appId])
      settings = await query("SELECT * FROM app_settings WHERE application_id = ?", [appId])
    }

    return NextResponse.json({
      success: true,
      settings: Array.isArray(settings) && settings.length > 0 ? settings[0] : null,
    })
  } catch (error) {
    console.error("Fetch settings error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { login_success_msg, login_error_msg, sub_expired_msg, banned_msg, hwid_mismatch_msg } = await request.json()
    const { id: appId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    await query(
      `UPDATE app_settings SET 
       login_success_msg = ?, 
       login_error_msg = ?, 
       sub_expired_msg = ?, 
       banned_msg = ?, 
       hwid_mismatch_msg = ? 
       WHERE application_id = ?`,
      [login_success_msg, login_error_msg, sub_expired_msg, banned_msg, hwid_mismatch_msg, appId],
    )

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
