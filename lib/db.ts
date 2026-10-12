import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
    pgPool: Pool | undefined;
    pgUrl: string | undefined;
};

const dbUrl = process.env.DATABASE_URL?.trim();

const isSupabase =
    dbUrl?.includes("supabase.co") ||
    dbUrl?.includes("supabase.com") ||
    dbUrl?.includes("pooler");

if (!globalForPg.pgPool || globalForPg.pgUrl !== dbUrl) {
    if (globalForPg.pgPool) {
        globalForPg.pgPool.end().catch(() => {});
    }
    if (dbUrl) {
        globalForPg.pgPool = new Pool({
            connectionString: dbUrl,
            ssl: isSupabase || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 10000,
        });
        globalForPg.pgUrl = dbUrl;
    } else {
        globalForPg.pgPool = undefined;
        globalForPg.pgUrl = undefined;
    }
}

export const pool = globalForPg.pgPool;
export const isDbConfigured = Boolean(dbUrl);

