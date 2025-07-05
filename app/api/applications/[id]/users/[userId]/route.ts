import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id: appId } = await params
    const { userId } = await params

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])
    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    await query("DELETE FROM licenses WHERE id = ? AND application_id = ?", [userId, appId])

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id: appId } = await params
    const { userId } = await params
    const body = await request.json()

    const apps = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [appId, user.id])
    if (!Array.isArray(apps) || apps.length === 0) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    const existingUser = await query("SELECT id, username FROM licenses WHERE id = ? AND application_id = ?", [
      userId,
      appId,
    ])
    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const updateFields = []
    const updateValues = []

    if (body.username !== undefined) {
      const usernameCheck = await query(
        "SELECT id FROM licenses WHERE application_id = ? AND username = ? AND id != ? AND username IS NOT NULL",
        [appId, body.username, userId],
      )
      if (Array.isArray(usernameCheck) && usernameCheck.length > 0) {
        return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
      }
      updateFields.push("username = ?")
      updateValues.push(body.username)
    }

    if (body.password !== undefined && body.password !== "") {
      const saltRounds = 12
      const password_hash = await bcrypt.hash(body.password, saltRounds)
      updateFields.push("password_hash = ?")
      updateValues.push(password_hash)
    }

    if (body.subscription_type !== undefined) {
      updateFields.push("subscription_type = ?")
      updateValues.push(body.subscription_type)
    }

    if (body.expires_at !== undefined) {
      updateFields.push("expires_at = ?")
      updateValues.push(body.expires_at)
    }

    if (body.is_banned !== undefined) {
      updateFields.push("is_banned = ?")
      updateValues.push(body.is_banned)
    }

    if (body.reset_hwid === true) {
      updateFields.push("hwid = NULL")
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 })
    }

    updateValues.push(userId, appId)
    const updateQuery = `UPDATE licenses SET ${updateFields.join(", ")} WHERE id = ? AND application_id = ?`

    await query(updateQuery, updateValues)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
