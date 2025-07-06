import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    const { role } = await request.json()

    // Await the params object in Next.js 15
    const resolvedParams = await params
    const userId = resolvedParams.userId

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