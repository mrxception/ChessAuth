import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

// Define interfaces for type safety
interface LoginRequest {
  username: string
  password: string
}

interface UserData {
  id: number
  username: string
  email: string
  password_hash: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    const users = (await query("SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?", [
      username,
      username,
    ])) as UserData[]

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    const user = users[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Convert user.id to string for the JWT payload
    const token = generateToken({ 
      userId: user.id.toString(), 
      email: user.email, 
      role: "user" 
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error: unknown) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}