import fs from "fs/promises";
import path from "path";
import { pool } from "./db";

export type JobStatus =
  | "Wishlist"
  | "Applied"
  | "Screening"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Ghosted";

export type JobType = "Full-time" | "Internship" | "Contract" | "Part-time";

export type WorkplaceType = "Remote" | "Hybrid" | "On-site";

export interface JobApplication {
  id: string;
  userId?: string;
  company: string;
  position: string;
  status: JobStatus;
  jobType: JobType;
  workplaceType: WorkplaceType;
  location: string;
  salary?: string;
  appliedDate: string;
  followUpDate?: string;
  interviewDate?: string;
  jobUrl?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  priority?: "High" | "Medium" | "Low";
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "jobs.json");

const SEED_JOBS: JobApplication[] = [];


// Local file helpers (fallback / backup)
async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify(SEED_JOBS, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize jobs data file:", error);
  }
}

async function getLocalJobs(): Promise<JobApplication[]> {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return SEED_JOBS;
  } catch (error) {
    console.error("Error reading local jobs:", error);
    return SEED_JOBS;
  }
}

async function saveJobLocally(job: JobApplication): Promise<void> {
  try {
    const jobs = await getLocalJobs();
    const index = jobs.findIndex((j) => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.unshift(job);
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(jobs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save job locally:", err);
  }
}

async function updateJobLocally(
  id: string,
  updates: Partial<Omit<JobApplication, "id" | "createdAt">>
): Promise<JobApplication | null> {
  try {
    const jobs = await getLocalJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const updated: JobApplication = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    jobs[index] = updated;
    await fs.writeFile(DATA_FILE, JSON.stringify(jobs, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Failed to update job locally:", err);
    return null;
  }
}

async function deleteJobLocally(id: string): Promise<boolean> {
  try {
    const jobs = await getLocalJobs();
    const filtered = jobs.filter((j) => j.id !== id);
    if (filtered.length === jobs.length) return false;
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to delete job locally:", err);
    return false;
  }
}

async function resetLocalJobs(): Promise<JobApplication[]> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(SEED_JOBS, null, 2), "utf-8");
  return SEED_JOBS;
}

// Database helpers & schema initialization
let dbInitialized = false;

async function initDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (dbInitialized) return true;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Applied',
        job_type TEXT DEFAULT 'Full-time',
        workplace_type TEXT DEFAULT 'Remote',
        location TEXT,
        salary TEXT,
        applied_date TEXT,
        follow_up_date TEXT,
        interview_date TEXT,
        job_url TEXT,
        contact_name TEXT,
        contact_email TEXT,
        priority TEXT DEFAULT 'Medium',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    dbInitialized = true;
    return true;
  } catch (err: any) {
    console.warn("Database initialization failed (using local JSON storage fallback):", err.message);
    return false;
  }
}

function rowToJob(row: any): JobApplication {
  const appDate = row.applied_date
    ? String(row.applied_date).split("T")[0]
    : row.application_date
    ? String(row.application_date).split("T")[0]
    : "";

  return {
    id: String(row.id),
    userId: row.user_id || undefined,
    company: row.company || "",
    position: row.position || "",
    status: (row.status as JobStatus) || "Applied",
    jobType: (row.job_type as JobType) || (row.jobtype as JobType) || "Full-time",
    workplaceType: (row.workplace_type as WorkplaceType) || (row.workplacetype as WorkplaceType) || "Remote",
    location: row.location || "",
    salary: row.salary || "",
    appliedDate: appDate,
    followUpDate: row.follow_up_date ? String(row.follow_up_date).split("T")[0] : "",
    interviewDate: row.interview_date ? String(row.interview_date) : "",
    jobUrl: row.job_url || "",
    contactName: row.contact_name || "",
    contactEmail: row.contact_email || "",
    notes: row.notes || "",
    priority: row.priority || "Medium",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

async function insertJobIntoDb(job: JobApplication): Promise<void> {
  const appDate = job.appliedDate || new Date().toISOString().split("T")[0];
  await pool.query(
    `INSERT INTO jobs (
      id, user_id, company, position, status, job_type, workplace_type,
      location, salary, applied_date, application_date, follow_up_date, interview_date,
      job_url, contact_name, contact_email, priority, notes,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    ON CONFLICT (id) DO UPDATE SET
      user_id = COALESCE(EXCLUDED.user_id, jobs.user_id),
      company = EXCLUDED.company,
      position = EXCLUDED.position,
      status = EXCLUDED.status,
      job_type = EXCLUDED.job_type,
      workplace_type = EXCLUDED.workplace_type,
      location = EXCLUDED.location,
      salary = EXCLUDED.salary,
      applied_date = EXCLUDED.applied_date,
      application_date = EXCLUDED.application_date,
      follow_up_date = EXCLUDED.follow_up_date,
      interview_date = EXCLUDED.interview_date,
      job_url = EXCLUDED.job_url,
      contact_name = EXCLUDED.contact_name,
      contact_email = EXCLUDED.contact_email,
      priority = EXCLUDED.priority,
      notes = EXCLUDED.notes,
      updated_at = EXCLUDED.updated_at`,
    [
      job.id,
      job.userId || null,
      job.company,
      job.position,
      job.status,
      job.jobType,
      job.workplaceType,
      job.location,
      job.salary || "",
      appDate,
      appDate,
      job.followUpDate || null,
      job.interviewDate || null,
      job.jobUrl || "",
      job.contactName || "",
      job.contactEmail || "",
      job.priority || "Medium",
      job.notes || "",
      job.createdAt,
      job.updatedAt,
    ]
  );
}

// Exported high-level CRUD functions
export async function getAllJobs(userId?: string): Promise<JobApplication[]> {
  const isDbReady = await initDatabase();
  if (isDbReady) {
    try {
      let query = `SELECT * FROM jobs`;
      const params: any[] = [];
      if (userId) {
        query += ` WHERE user_id = $1 OR user_id IS NULL`;
        params.push(userId);
      }
      query += ` ORDER BY created_at DESC`;
      const result = await pool.query(query, params);
      return result.rows.map(rowToJob);
    } catch (err: any) {
      console.error("Error reading jobs from database:", err.message);
    }
  }

  const localJobs = await getLocalJobs();
  if (userId) {
    return localJobs.filter((j) => !j.userId || j.userId === userId);
  }
  return localJobs;
}

export async function getJobById(id: string): Promise<JobApplication | null> {
  const isDbReady = await initDatabase();
  if (isDbReady) {
    try {
      const result = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [id]);
      if (result.rows.length > 0) {
        return rowToJob(result.rows[0]);
      }
      return null;
    } catch (err: any) {
      console.error("Error reading job by id from database:", err.message);
    }
  }

  const jobs = await getLocalJobs();
  return jobs.find((j) => j.id === id) || null;
}

export async function createJob(
  jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">,
  userId?: string
): Promise<JobApplication> {
  const now = new Date().toISOString();
  const newJob: JobApplication = {
    ...jobData,
    userId,
    id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  const isDbReady = await initDatabase();
  if (isDbReady) {
    try {
      await insertJobIntoDb(newJob);
      saveJobLocally(newJob).catch(() => {});
      return newJob;
    } catch (err: any) {
      console.error("Error inserting job into database:", err.message);
    }
  }

  await saveJobLocally(newJob);
  return newJob;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<JobApplication, "id" | "createdAt">>
): Promise<JobApplication | null> {
  const isDbReady = await initDatabase();
  if (isDbReady) {
    try {
      const existing = await getJobById(id);
      if (!existing) return null;

      const updated: JobApplication = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const appDate = updated.appliedDate || null;

      await pool.query(
        `UPDATE jobs SET
          company = $1,
          position = $2,
          status = $3,
          job_type = $4,
          workplace_type = $5,
          location = $6,
          salary = $7,
          applied_date = $8,
          application_date = $9,
          follow_up_date = $10,
          interview_date = $11,
          job_url = $12,
          contact_name = $13,
          contact_email = $14,
          priority = $15,
          notes = $16,
          updated_at = $17
        WHERE id = $18`,
        [
          updated.company,
          updated.position,
          updated.status,
          updated.jobType,
          updated.workplaceType,
          updated.location,
          updated.salary,
          appDate,
          appDate,
          updated.followUpDate || null,
          updated.interviewDate || null,
          updated.jobUrl,
          updated.contactName,
          updated.contactEmail,
          updated.priority,
          updated.notes,
          updated.updatedAt,
          id,
        ]
      );

      updateJobLocally(id, updates).catch(() => {});
      return updated;
    } catch (err: any) {
      console.error("Error updating job in database:", err.message);
    }
  }

  return updateJobLocally(id, updates);
}

export async function deleteJob(id: string): Promise<boolean> {
  const isDbReady = await initDatabase();
  if (isDbReady) {
    try {
      const res = await pool.query(`DELETE FROM jobs WHERE id = $1`, [id]);
      deleteJobLocally(id).catch(() => {});
      return (res.rowCount ?? 0) > 0;
    } catch (err: any) {
      console.error("Error deleting job from database:", err.message);
    }
  }

  return deleteJobLocally(id);
}

export async function resetToSeedJobs(): Promise<JobApplication[]> {
  const isDbReady = await initDatabase();
  if (isDbReady) {
    try {
      await pool.query(`DELETE FROM jobs`);
      resetLocalJobs().catch(() => {});
      return [];
    } catch (err: any) {
      console.error("Error resetting jobs in database:", err.message);
    }
  }

  return resetLocalJobs();
}

