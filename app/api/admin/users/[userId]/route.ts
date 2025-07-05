import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const userId = params.userId

    const targetUser = await query("SELECT role FROM users WHERE id = ?", [userId])
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
