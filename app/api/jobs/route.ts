type Job = {
  id: number;
  company: string;
  position: string;
  status: string;
  date: string;
  notes: string;
};

const jobs: Job[] = [];

export async function GET() {
  return Response.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newJob: Job = {
    id: Date.now(),
    company: body.company,
    position: body.position,
    status: body.status,
    date: body.date,
    notes: body.notes,
  };

  jobs.push(newJob);

  return Response.json(newJob, {
    status: 201,
  });
}