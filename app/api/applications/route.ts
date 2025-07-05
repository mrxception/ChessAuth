import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken, generateKey } from "@/lib/auth"

interface Application {
  id: number
  user_id: number
  app_name: string
  public_key: string
  secret_key: string
  created_at: string
  updated_at: string
}

interface InsertResult {
  insertId: number
  affectedRows: number
}

interface CreateApplicationRequest {
  app_name: string
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const applications = (await query("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC", [
      user.id,
    ])) as Application[]

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error: unknown) {
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

    const body = (await request.json()) as CreateApplicationRequest
    const { app_name } = body

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
    )) as InsertResult

    await query("INSERT INTO app_settings (application_id) VALUES (?)", [result.insertId])

    return NextResponse.json({
      success: true,
      message: "Application created successfully",
    })
  } catch (error: unknown) {
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
