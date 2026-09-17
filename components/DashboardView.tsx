"use client";

import React, { useState } from "react";
import Link from "next/link";
import { JobApplication, JobStatus } from "@/lib/jobs";
import StatsCard from "./StatsCard";
import StatusBadge, { STATUS_CONFIG } from "./StatusBadge";
import JobDetailModal from "./JobDetailModal";
import { useToast } from "./Toast";
import {
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  Kanban,
  Download,
  Sparkles,
  Building2,
} from "lucide-react";

interface DashboardViewProps {
  initialJobs: JobApplication[];
}

export default function DashboardView({ initialJobs }: DashboardViewProps) {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const { showToast } = useToast();

  const total = jobs.length;
  const interviewing = jobs.filter((j) => j.status === "Interviewing").length;
  const screening = jobs.filter((j) => j.status === "Screening").length;
  const applied = jobs.filter((j) => j.status === "Applied").length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;
  const activePipelines = applied + screening + interviewing;

  const responseRate =
    total > 0
      ? Math.round(
          ((interviewing + screening + offers) /
            (total - jobs.filter((j) => j.status === "Wishlist").length || 1)) *
            100
        )
      : 0;

  const upcomingEvents = jobs
    .filter((j) => j.interviewDate || j.followUpDate)
    .sort((a, b) => {
      const dateA = a.interviewDate || a.followUpDate || "";
      const dateB = b.interviewDate || b.followUpDate || "";
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    })
    .slice(0, 4);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleUpdateStatus = async (id: string, newStatus: JobStatus) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
        if (selectedJob?.id === id) {
          setSelectedJob(updated);
        }
        showToast(`Moved to ${newStatus}`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        const updated = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
        if (selectedJob?.id === id) {
          setSelectedJob(updated);
        }
        showToast("Notes updated!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update notes", "error");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        showToast("Application deleted", "info");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete application", "error");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Company", "Position", "Status", "Job Type", "Location", "Salary", "Applied Date", "Notes"];
    const rows = jobs.map((j) => [
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.position.replace(/"/g, '""')}"`,
      `"${j.status}"`,
      `"${j.jobType}"`,
      `"${j.location.replace(/"/g, '""')}"`,
      `"${j.salary || ""}"`,
      `"${j.appliedDate}"`,
      `"${(j.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported applications to CSV", "info");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner in White/Orange/Green */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-200/70 bg-gradient-to-br from-orange-50/80 via-white to-emerald-50/60 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Career Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Application Analytics & Pipeline
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Track interviews, monitor hiring stages, and accelerate your job search with complete pipeline visibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/jobs"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 border border-slate-200 shadow-xs transition-all"
            >
              <Kanban className="w-4 h-4 text-orange-600" />
              <span>Kanban Board</span>
            </Link>

            <Link
              href="/jobs/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Application</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={total}
          subtitle={`${jobs.filter((j) => j.status === "Wishlist").length} in wishlist`}
          icon={Briefcase}
          color="orange"
          trend={`${activePipelines} in pipeline`}
        />

        <StatsCard
          title="Interviews & Screening"
          value={interviewing + screening}
          subtitle={`${interviewing} active interview rounds`}
          icon={Calendar}
          color="amber"
          trend="In Progress"
        />

        <StatsCard
          title="Offers Received"
          value={offers}
          subtitle={offers > 0 ? "Congratulations! 🎉" : "Keep pushing!"}
          icon={Award}
          color="emerald"
          trend={offers > 0 ? "Offer Stage" : "Goal: 1+"}
        />

        <StatsCard
          title="Response Rate"
          value={`${responseRate}%`}
          subtitle="Screening / Interview rate"
          icon={TrendingUp}
          color="emerald"
          trend="High Interest"
        />
      </div>

      {/* Pipeline Progression Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Pipeline Progression</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {activePipelines} Active Opportunities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Wishlist", count: jobs.filter((j) => j.status === "Wishlist").length, color: "bg-orange-400" },
            { label: "Applied", count: applied, color: "bg-slate-500" },
            { label: "Screening", count: screening, color: "bg-amber-500" },
            { label: "Interviewing", count: interviewing, color: "bg-orange-500" },
            { label: "Offer", count: offers, color: "bg-emerald-500" },
            { label: "Rejected", count: rejected, color: "bg-rose-500" },
          ].map((stage) => {
            const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
            return (
              <div
                key={stage.label}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{stage.label}</span>
                    <span className="text-base font-extrabold text-slate-900">{stage.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-2">{pct}% of total</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Upcoming Interviews + Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Follow-ups & Interviews (1 col) */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Agenda & Follow-ups</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">{upcomingEvents.length} items</span>
          </div>

          <div className="space-y-3 flex-1">
            {upcomingEvents.length === 0 ? (
              <div className="h-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Calendar className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">No scheduled interviews or follow-ups.</p>
              </div>
            ) : (
              upcomingEvents.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                        {job.company}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-700 transition-colors">
                        {job.position}
                      </p>
                    </div>
                    <StatusBadge status={job.status} size="sm" />
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      {job.interviewDate
                        ? new Date(job.interviewDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })
                        : job.followUpDate}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {job.interviewDate ? "Interview" : "Follow-up"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications Feed (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Recent Applications</span>
            </h3>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <span>View all ({total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {recentJobs.length === 0 ? (
              <div className="h-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Building2 className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">No applications added yet.</p>
                <Link
                  href="/jobs/new"
                  className="mt-3 text-xs font-semibold text-orange-600 hover:underline"
                >
                  Create your first application
                </Link>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50/70 hover:bg-orange-50/50 border border-slate-200/80 hover:border-orange-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs shadow-xs">
                      {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider truncate">
                          {job.company}
                        </span>
                        <span className="text-xs text-slate-400">• {job.workplaceType}</span>
                      </div>
                      <p className="text-sm text-slate-800 font-semibold truncate group-hover:text-orange-700 transition-colors">
                        {job.position}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-slate-500">{job.appliedDate}</p>
                      {job.salary && (
                        <p className="text-xs text-emerald-700 font-bold truncate max-w-[120px]">
                          {job.salary}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Utility Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 hover:text-slate-900 font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export to CSV</span>
          </button>
        </div>

        <p className="text-slate-400">
          CareerPulse • White, Orange & Green Career Tracker
        </p>
      </div>

      {/* Application Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateNotes={handleUpdateNotes}
        onDelete={handleDeleteJob}
      />
    </div>
  );
}
