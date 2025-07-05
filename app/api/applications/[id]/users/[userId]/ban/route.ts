import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { is_banned } = await request.json()
    const { id: appId, userId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    await query("UPDATE licenses SET is_banned = ? WHERE id = ? AND application_id = ?", [is_banned, userId, appId])

    return NextResponse.json({
      success: true,
      message: `User ${is_banned ? "banned" : "unbanned"} successfully`,
    })
  } catch (error) {
    console.error("Ban user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
