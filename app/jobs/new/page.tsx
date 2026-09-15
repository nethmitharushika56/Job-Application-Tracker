import Link from "next/link";
import JobForm from "@/components/JobForm";
import {
  ChevronRight,
  Sparkles,
  FileCheck,
  Target,
} from "lucide-react";

export default function NewJobPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-orange-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/jobs" className="hover:text-orange-600 transition-colors">
          Applications
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-orange-600 font-bold">New Application</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Application Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Add New Job Application
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Log all critical details, salary expectations, follow-up dates, and recruiter notes.
            </p>
          </div>

          <JobForm />
        </div>

        {/* Sidebar Tips (1 col) */}
        <div className="space-y-4 lg:pt-14">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-orange-600" />
              Pro Tracking Tips
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-bold text-[10px]">
                  1
                </span>
                <span>
                  <strong className="text-slate-800">Copy the Job Posting URL</strong>: Listings often disappear once candidates are selected. Having the link helps refresh your memory before an interview.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-bold text-[10px]">
                  2
                </span>
                <span>
                  <strong className="text-slate-800">Schedule Follow-ups</strong>: Set a follow-up date 7 to 10 days after applying if you haven&apos;t heard back from the hiring team.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-bold text-[10px]">
                  3
                </span>
                <span>
                  <strong className="text-slate-800">Capture Recruiter Info</strong>: Store the recruiter or hiring manager name to personalize follow-up emails and thank-you notes.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-orange-50/50 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Instant Sync & Analytics
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every application you add is instantly synced to your local store, updated on your Kanban board, and computed in your real-time analytics dashboard.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}