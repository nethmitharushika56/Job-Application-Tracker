import fs from "fs/promises";
import path from "path";

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

const SEED_JOBS: JobApplication[] = [
  {
    id: "job-1",
    company: "Stripe",
    position: "Frontend Infrastructure Engineer",
    status: "Interviewing",
    jobType: "Full-time",
    workplaceType: "Remote",
    location: "San Francisco, CA (Remote)",
    salary: "$165,000 - $190,000",
    appliedDate: "2026-08-28",
    followUpDate: "2026-09-18",
    interviewDate: "2026-09-18T14:00:00",
    jobUrl: "https://stripe.com/jobs",
    contactName: "Sarah Jenkins",
    contactEmail: "sjenkins@stripe.com",
    notes: "Completed initial recruiter screening. Technical round focused on React concurrency, micro-frontends, and performance metrics scheduled.",
    priority: "High",
    createdAt: "2026-08-28T10:00:00.000Z",
    updatedAt: "2026-09-12T15:30:00.000Z",
  },
  {
    id: "job-2",
    company: "Vercel",
    position: "Senior Full Stack Engineer",
    status: "Offer",
    jobType: "Full-time",
    workplaceType: "Remote",
    location: "Global Remote",
    salary: "$175,000 - $210,000",
    appliedDate: "2026-08-15",
    followUpDate: "2026-09-20",
    jobUrl: "https://vercel.com/careers",
    contactName: "Alex Rivera",
    contactEmail: "alex.r@vercel.com",
    notes: "Offer package received! Reviewing equity grant and 401(k) match. Follow-up discussion set for Friday.",
    priority: "High",
    createdAt: "2026-08-15T09:30:00.000Z",
    updatedAt: "2026-09-14T11:20:00.000Z",
  },
  {
    id: "job-3",
    company: "Figma",
    position: "Product Designer & UI Engineer",
    status: "Screening",
    jobType: "Full-time",
    workplaceType: "Hybrid",
    location: "New York, NY",
    salary: "$150,000 - $175,000",
    appliedDate: "2026-09-05",
    followUpDate: "2026-09-19",
    interviewDate: "2026-09-19T11:00:00",
    jobUrl: "https://figma.com/careers",
    contactName: "Elena Rostova",
    contactEmail: "elena@figma.com",
    notes: "Recruiter phone call scheduled to discuss design systems portfolio and component libraries.",
    priority: "High",
    createdAt: "2026-09-05T14:00:00.000Z",
    updatedAt: "2026-09-10T16:00:00.000Z",
  },
  {
    id: "job-4",
    company: "Linear",
    position: "Web Applications Developer",
    status: "Applied",
    jobType: "Full-time",
    workplaceType: "Remote",
    location: "San Francisco / Remote",
    salary: "$160,000 - $185,000",
    appliedDate: "2026-09-10",
    followUpDate: "2026-09-24",
    jobUrl: "https://linear.app/careers",
    contactName: "Marcus Vance",
    notes: "Submitted application via referral. Focused resume on keyboard shortcuts, synced local databases, and fast UI responsiveness.",
    priority: "Medium",
    createdAt: "2026-09-10T12:00:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "job-5",
    company: "Airbnb",
    position: "Software Engineer - Guest Experience",
    status: "Wishlist",
    jobType: "Full-time",
    workplaceType: "Hybrid",
    location: "San Francisco, CA",
    salary: "$155,000 - $180,000",
    appliedDate: "2026-09-15",
    jobUrl: "https://careers.airbnb.com",
    notes: "Drafting custom cover letter highlighting internationalization and high-traffic booking engines.",
    priority: "Medium",
    createdAt: "2026-09-15T08:00:00.000Z",
    updatedAt: "2026-09-15T08:00:00.000Z",
  },
  {
    id: "job-6",
    company: "Datadog",
    position: "Cloud Systems & Observability Engineer",
    status: "Rejected",
    jobType: "Full-time",
    workplaceType: "Remote",
    location: "Boston, MA",
    salary: "$145,000 - $165,000",
    appliedDate: "2026-08-01",
    jobUrl: "https://datadoghq.com/careers",
    notes: "Position filled internally. Recommended reapplying for Q1 engineering positions.",
    priority: "Low",
    createdAt: "2026-08-01T11:00:00.000Z",
    updatedAt: "2026-08-20T09:00:00.000Z",
  },
];

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

export async function getAllJobs(): Promise<JobApplication[]> {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return SEED_JOBS;
  } catch (error) {
    console.error("Error reading jobs:", error);
    return SEED_JOBS;
  }
}

export async function getJobById(id: string): Promise<JobApplication | null> {
  const jobs = await getAllJobs();
  return jobs.find((j) => j.id === id) || null;
}

export async function createJob(
  jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
): Promise<JobApplication> {
  const jobs = await getAllJobs();
  const now = new Date().toISOString();
  const newJob: JobApplication = {
    ...jobData,
    id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  jobs.unshift(newJob);
  await fs.writeFile(DATA_FILE, JSON.stringify(jobs, null, 2), "utf-8");
  return newJob;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<JobApplication, "id" | "createdAt">>
): Promise<JobApplication | null> {
  const jobs = await getAllJobs();
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
}

export async function deleteJob(id: string): Promise<boolean> {
  const jobs = await getAllJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  if (filtered.length === jobs.length) return false;

  await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export async function resetToSeedJobs(): Promise<JobApplication[]> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(SEED_JOBS, null, 2), "utf-8");
  return SEED_JOBS;
}
