import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const { id: applicationId } = await params

    const applications = await query("SELECT id FROM applications WHERE id = ? AND user_id = ?", [
      applicationId,
      user.id,
    ])

    if (!Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        { status: 404 },
      )
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const action = url.searchParams.get("action") || ""
    const dateFrom = url.searchParams.get("dateFrom") || ""
    const dateTo = url.searchParams.get("dateTo") || ""

    const offset = (page - 1) * limit

    let whereClause = "WHERE application_id = ?"
    const queryParams = [applicationId]

    if (search) {
      whereClause += " AND (username LIKE ? OR action LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (action) {
      whereClause += " AND action = ?"
      queryParams.push(action)
    }

    if (dateFrom) {
      whereClause += " AND timestamp >= ?"
      queryParams.push(dateFrom)
    }

    if (dateTo) {
      whereClause += " AND timestamp <= ?"
      queryParams.push(dateTo + " 23:59:59")
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM logs ${whereClause}`, queryParams)
    const total = Array.isArray(countResult) ? (countResult[0] as any).total : 0

    const logs = await query(
      `SELECT id, username, action, user_agent, timestamp 
       FROM logs ${whereClause} 
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    )

    const actionsResult = await query("SELECT DISTINCT action FROM logs WHERE application_id = ? ORDER BY action", [
      applicationId,
    ])
    const actions = Array.isArray(actionsResult) ? actionsResult.map((row: any) => row.action) : []

    return NextResponse.json({
      success: true,
      logs: Array.isArray(logs) ? logs : [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      actions,
    })
  } catch (error) {
    console.error("Fetch logs error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
