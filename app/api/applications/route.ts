import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken, generateKey } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const applications = await query("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC", [user.id])

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Fetch applications error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { app_name } = await request.json()

    if (!app_name) {
      return NextResponse.json(
        {
          success: false,
          message: "App name is required",
        },
        { status: 400 },
      )
    }

    const publicKey = generateKey("pk")
    const secretKey = generateKey("sk")

    const result = (await query(
      "INSERT INTO applications (user_id, app_name, public_key, secret_key) VALUES (?, ?, ?, ?)",
      [user.id, app_name, publicKey, secretKey],
    )) as any

    await query("INSERT INTO app_settings (application_id) VALUES (?)", [result.insertId])

    return NextResponse.json({
      success: true,
      message: "Application created successfully",
    })
  } catch (error) {
    console.error("Create application error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
