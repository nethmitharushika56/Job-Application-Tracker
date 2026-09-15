import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, deleteJob } from "@/lib/jobs";

type RouteParams = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error retrieving job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateJob(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const success = await deleteJob(id);

    if (!success) {
      return NextResponse.json({ error: "Job application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job application deleted" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
