import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const { role } = await request.json()
    const userId = params.userId

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 })
    }

    await query("UPDATE users SET role = ? WHERE id = ?", [role, userId])

    return NextResponse.json({ success: true, message: "User role updated successfully" })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
