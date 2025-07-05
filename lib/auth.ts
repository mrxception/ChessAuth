import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "chess-auth-secret-key"

interface JwtPayload {
  userId: string
  email: string
  role?: string
}

export interface User {
  id: string
  email: string
  username: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function generateKey(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = prefix + "_chess_"
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const users = await query("SELECT id, email, username, role FROM users WHERE id = ?", [decoded.userId])
  return Array.isArray(users) && users.length > 0 ? (users[0] as User) : null
}