import crypto from "crypto";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { pool } from "./db";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
  updatedAt: string;
}

export const SESSION_COOKIE_NAME = "careerpulse_session";
const SESSION_SECRET = process.env.AUTH_SECRET || "careerpulse-secure-key-2026-auth-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// ==================== Cryptography Helpers ====================

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, storedHash] = combinedHash.split(":");
    if (!salt || !storedHash) return false;
    const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(storedHash, "hex"),
      Buffer.from(computedHash, "hex")
    );
  } catch {
    return false;
  }
}

export function createSessionToken(user: { id: string; name: string; email: string }): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    exp,
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(
  token: string
): { id: string; name: string; email: string } | null {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf8"),
        Buffer.from(expectedSig, "utf8")
      )
    ) {
      return null;
    }

    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);

    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

// ==================== Local Fallback Storage ====================

async function ensureUsersFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize users data file:", error);
  }
}

async function getLocalUsers(): Promise<UserRecord[]> {
  await ensureUsersFile();
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveUserLocally(user: UserRecord): Promise<void> {
  const users = await getLocalUsers();
  users.push(user);
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// ==================== Database User Management ====================

let usersTableInitialized = false;

export async function initUserTable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (usersTableInitialized) return true;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    usersTableInitialized = true;
    return true;
  } catch (err: any) {
    console.warn("Users table init failed (falling back to local):", err.message);
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const isDbReady = await initUserTable();
  const normalizedEmail = email.trim().toLowerCase();

  if (isDbReady) {
    try {
      const res = await pool.query(
        `SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE LOWER(email) = $1 LIMIT 1`,
        [normalizedEmail]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          passwordHash: row.password_hash,
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
        };
      }
      return null;
    } catch (err: any) {
      console.error("Error finding user by email in database:", err.message);
    }
  }

  const localUsers = await getLocalUsers();
  return (
    localUsers.find((u) => u.email.toLowerCase() === normalizedEmail) || null
  );
}

export async function findUserById(id: string): Promise<User | null> {
  const isDbReady = await initUserTable();

  if (isDbReady) {
    try {
      const res = await pool.query(
        `SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          createdAt: new Date(row.created_at).toISOString(),
        };
      }
      return null;
    } catch (err: any) {
      console.error("Error finding user by id in database:", err.message);
    }
  }

  const localUsers = await getLocalUsers();
  const found = localUsers.find((u) => u.id === id);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    email: found.email,
    createdAt: found.createdAt,
  };
}

export async function createUser(
  name: string,
  email: string,
  passwordPlain: string
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const passwordHash = hashPassword(passwordPlain);
  const now = new Date().toISOString();
  const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const userRecord: UserRecord = {
    id,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  const isDbReady = await initUserTable();
  if (isDbReady) {
    try {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userRecord.id,
          userRecord.name,
          userRecord.email,
          userRecord.passwordHash,
          userRecord.createdAt,
          userRecord.updatedAt,
        ]
      );
      // Background mirror to local storage
      saveUserLocally(userRecord).catch(() => {});
      return {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        createdAt: userRecord.createdAt,
      };
    } catch (err: any) {
      console.error("Error creating user in database:", err.message);
      throw new Error(err.message || "Failed to create user in database");
    }
  }

  await saveUserLocally(userRecord);
  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    createdAt: userRecord.createdAt,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) return null;

    const payload = verifySessionToken(sessionToken);
    if (!payload) return null;

    const user = await findUserById(payload.id);
    return user;
  } catch {
    return null;
  }
}
