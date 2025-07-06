import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; licenseId: string }> }) {
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

    // Await the params object and destructure both values
    const resolvedParams = await params
    const { id: appId, licenseId } = resolvedParams

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])
    
    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    await query("DELETE FROM licenses WHERE id = ? AND application_id = ?", [licenseId, appId])

    return NextResponse.json({
      success: true,
      message: "License deleted successfully",
    })
  } catch (error) {
    console.error("Delete license error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}