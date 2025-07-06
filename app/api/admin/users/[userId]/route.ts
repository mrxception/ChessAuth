import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    
    // Check if authHeader exists and starts with "Bearer "
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.substring(7) // This is now guaranteed to be a string
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const resolvedParams = await params
    const userId = resolvedParams.userId

    const targetUser = await query("SELECT role FROM users WHERE id = ?", [userId]) as Array<{ role: string }>

    if (targetUser[0]?.role === "admin") {
      return NextResponse.json({ success: false, message: "Cannot delete admin users" }, { status: 403 })
    }

    await query("DELETE FROM users WHERE id = ? AND role = 'user'", [userId])

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}