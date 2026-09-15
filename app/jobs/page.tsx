import { getAllJobs } from "@/lib/jobs";
import ApplicationsView from "@/components/ApplicationsView";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getAllJobs();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <ApplicationsView initialJobs={jobs} />
    </main>
  );
}