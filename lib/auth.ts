import crypto from "crypto";
import { cookies } from "next/headers";
import { pool, isDbConfigured } from "./db";
import { readStorageFile, writeStorageFile } from "./storage";

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

// ==================== Storage Helpers ====================

async function getLocalUsers(): Promise<UserRecord[]> {
  return await readStorageFile<UserRecord[]>("users.json", []);
}

async function saveUserLocally(user: UserRecord): Promise<void> {
  const users = await getLocalUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await writeStorageFile("users.json", users);
}

// ==================== Database User Management ====================

let usersTableInitialized = false;

export async function initUserTable(): Promise<boolean> {
  if (!pool || !isDbConfigured) return false;
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
    console.warn("Users table init failed (falling back to storage):", err.message);
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const isDbReady = await initUserTable();
  const normalizedEmail = email.trim().toLowerCase();

  if (isDbReady && pool) {
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

  if (isDbReady && pool) {
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
  if (isDbReady && pool) {
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

// ==================== Password Reset Management ====================

interface ResetCodeEntry {
  email: string;
  code: string;
  expiresAt: number;
}

const globalForResetCodes = globalThis as unknown as {
  resetCodes: Map<string, ResetCodeEntry> | undefined;
};

if (!globalForResetCodes.resetCodes) {
  globalForResetCodes.resetCodes = new Map<string, ResetCodeEntry>();
}

const resetCodesMap = globalForResetCodes.resetCodes;

export async function createPasswordResetCode(
  email: string
): Promise<{ code: string; user: User }> {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = await findUserByEmail(normalizedEmail);
  if (!userRecord) {
    throw new Error("No account found with this email address.");
  }

  // Generate a random 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  resetCodesMap.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt,
  });

  return {
    code,
    user: {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      createdAt: userRecord.createdAt,
    },
  };
}

export async function resetUserPassword(
  email: string,
  code: string,
  newPasswordPlain: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = code.trim();

  if (!newPasswordPlain || newPasswordPlain.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const entry = resetCodesMap.get(normalizedEmail);
  if (!entry) {
    throw new Error("No active password reset request found. Please request a new code.");
  }

  if (Date.now() > entry.expiresAt) {
    resetCodesMap.delete(normalizedEmail);
    throw new Error("The reset code has expired. Please request a new one.");
  }

  if (entry.code !== trimmedCode) {
    throw new Error("Invalid verification code. Please check and try again.");
  }

  const userRecord = await findUserByEmail(normalizedEmail);
  if (!userRecord) {
    throw new Error("User account not found.");
  }

  const newHash = hashPassword(newPasswordPlain);
  const now = new Date().toISOString();

  // Update in database if ready
  const isDbReady = await initUserTable();
  if (isDbReady && pool) {
    try {
      await pool.query(
        `UPDATE users SET password_hash = $1, updated_at = $2 WHERE LOWER(email) = $3`,
        [newHash, now, normalizedEmail]
      );
    } catch (err: any) {
      console.error("Error updating user password in DB:", err.message);
    }
  }

  // Update in safe storage
  const localUsers = await getLocalUsers();
  const index = localUsers.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (index >= 0) {
    localUsers[index].passwordHash = newHash;
    localUsers[index].updatedAt = now;
  } else {
    localUsers.push({
      ...userRecord,
      passwordHash: newHash,
      updatedAt: now,
    });
  }
  await writeStorageFile("users.json", localUsers);

  // Invalidate code after successful reset
  resetCodesMap.delete(normalizedEmail);

  return true;
}

