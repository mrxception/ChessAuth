import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Await the params object
    const resolvedParams = await params
    const { id: appId } = resolvedParams

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    await query("DELETE FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    })
  } catch (error) {
    console.error("Delete application error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json()

    // Await the params object
    const resolvedParams = await params
    const { id: appId } = resolvedParams

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])

    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    if (body.hwid_lock !== undefined) {
      await query("UPDATE applications SET hwid_lock = ? WHERE id = ? AND user_id = ?", [
        body.hwid_lock,
        appId,
        user.id,
      ])
    }

    if (body.status !== undefined) {
      await query("UPDATE applications SET status = ? WHERE id = ? AND user_id = ?", [body.status, appId, user.id])
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Update application error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
