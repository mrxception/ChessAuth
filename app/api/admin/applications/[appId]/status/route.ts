import { NextRequest, NextResponse } from "next/server"
import { getUserFromToken, User } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  // Await the params since they're now a Promise
  const { userId } = await context.params

  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user: User | null = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { role } = await request.json()

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await query("UPDATE users SET role = ? WHERE id = ?", [role, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}