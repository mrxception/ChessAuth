import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken, verifyPassword, hashPassword } from "@/lib/auth"

// Define interfaces for type safety
interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface UserPasswordData {
  password_hash: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChangePasswordRequest
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided",
        },
        { status: 401 },
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 },
      )
    }

    const users = (await query("SELECT password_hash FROM users WHERE id = ?", [user.id])) as UserPasswordData[]
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      )
    }

    const userData = users[0]

    const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password_hash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        { status: 400 },
      )
    }

    const newPasswordHash = await hashPassword(newPassword)

    await query("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      newPasswordHash,
      user.id,
    ])

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error: unknown) {
    console.error("Change password error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
