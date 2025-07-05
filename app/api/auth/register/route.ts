import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    
    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      )
    }

    
    const existingUsers = await query("SELECT id FROM users WHERE email = ? OR username = ?", [email, username])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 },
      )
    }

    
    const passwordHash = await hashPassword(password)

    await query("INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)", [email, username, passwordHash])

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
