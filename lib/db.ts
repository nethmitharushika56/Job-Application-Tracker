import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
    pgPool: Pool | undefined;
    pgUrl: string | undefined;
};

const isSupabase =
    process.env.DATABASE_URL?.includes("supabase.co") ||
    process.env.DATABASE_URL?.includes("supabase.com") ||
    process.env.DATABASE_URL?.includes("pooler");

if (!globalForPg.pgPool || globalForPg.pgUrl !== process.env.DATABASE_URL) {
    if (globalForPg.pgPool) {
        globalForPg.pgPool.end().catch(() => {});
    }
    globalForPg.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
    globalForPg.pgUrl = process.env.DATABASE_URL;
}

export const pool = globalForPg.pgPool;
