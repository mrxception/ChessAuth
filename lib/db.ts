import mysql from "mysql2/promise"

export const db = await mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12788046',
  password: 'IbFS1IALaK',
  database: 'sql12788046',
})

export async function query(sql: string, params: unknown[] = []) {
  try {
    const [results] = await db.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}