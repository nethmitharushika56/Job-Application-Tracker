import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 px-8 py-4 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-xl font-bold">
          JobTracker
        </h1>

        <div className="flex gap-6">
          <Link href="/">
            Dashboard
          </Link>

          <Link href="/jobs">
            Jobs
          </Link>

          <Link href="/jobs/new">
            Add Application
          </Link>
        </div>
      </div>
    </nav>
  );
}