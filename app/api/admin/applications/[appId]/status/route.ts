import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PATCH(request: NextRequest, context: { params: { appId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { status } = await request.json()
    const appId = context.params.appId

    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await query("UPDATE applications SET status = ? WHERE id = ?", [status, appId])

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Update application status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}