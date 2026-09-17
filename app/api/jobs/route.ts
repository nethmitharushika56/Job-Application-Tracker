import { NextRequest, NextResponse } from "next/server";
import {
  getAllJobs,
  createJob,
  resetToSeedJobs,
  JobApplication,
  JobStatus,
  JobType,
  WorkplaceType,
} from "@/lib/jobs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();
    const sort = searchParams.get("sort") || "date-desc";

    let jobs = await getAllJobs();

    if (status && status !== "All") {
      jobs = jobs.filter((job) => job.status.toLowerCase() === status.toLowerCase());
    }

    if (query) {
      jobs = jobs.filter(
        (job) =>
          job.company.toLowerCase().includes(query) ||
          job.position.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          (job.notes && job.notes.toLowerCase().includes(query))
      );
    }

    if (sort === "date-desc") {
      jobs.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    } else if (sort === "date-asc") {
      jobs.sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime());
    } else if (sort === "company") {
      jobs.sort((a, b) => a.company.localeCompare(b.company));
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "reset") {
      const resetJobs = await resetToSeedJobs();
      return NextResponse.json(resetJobs);
    }

    if (!body.company || !body.position) {
      return NextResponse.json(
        { error: "Company and position are required." },
        { status: 400 }
      );
    }

    const jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> = {
      company: body.company.trim(),
      position: body.position.trim(),
      status: (body.status as JobStatus) || "Applied",
      jobType: (body.jobType as JobType) || "Full-time",
      workplaceType: (body.workplaceType as WorkplaceType) || "Remote",
      location: body.location?.trim() || "Remote",
      salary: body.salary?.trim() || "",
      appliedDate: body.appliedDate || new Date().toISOString().split("T")[0],
      followUpDate: body.followUpDate || "",
      interviewDate: body.interviewDate || "",
      jobUrl: body.jobUrl?.trim() || "",
      contactName: body.contactName?.trim() || "",
      contactEmail: body.contactEmail?.trim() || "",
      notes: body.notes?.trim() || "",
      priority: body.priority || "Medium",
    };

    const newJob = await createJob(jobData);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
  }
}