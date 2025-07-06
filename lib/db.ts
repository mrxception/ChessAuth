import mysql from "mysql2/promise"

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12788046',
  password: 'IbFS1IALaK',
  database: 'sql12788046',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function query(sql: string, params: unknown[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Optional: Export the pool if you need direct access elsewhere
export { pool as db }