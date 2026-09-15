type Job = {
  id: number;
  company: string;
  position: string;
  status: string;
  date: string;
  notes: string;
};

async function getJobs(): Promise<Job[]> {
  const response = await fetch("http://localhost:3000/api/jobs", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          My Applications
        </h1>

        <p className="mt-2 text-gray-600">
          View and manage your job applications.
        </p>

        <div className="mt-8 space-y-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500">
              No applications added yet.
            </p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {job.position}
                    </h2>

                    <p className="text-gray-600">
                      {job.company}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-200 px-3 py-1 text-sm">
                    {job.status}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Applied: {job.date}
                </p>

                {job.notes && (
                  <p className="mt-3 text-gray-700">
                    {job.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}