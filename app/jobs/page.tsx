import JobForm from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          Add Application
        </h1>

        <p className="mt-2 text-gray-600">
          Add a new internship or job application.
        </p>

        <JobForm />
      </div>
    </main>
  );
}