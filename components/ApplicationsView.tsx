"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { JobApplication, JobStatus } from "@/lib/jobs";
import KanbanBoard from "./KanbanBoard";
import JobTable from "./JobTable";
import JobDetailModal from "./JobDetailModal";
import { STATUS_CONFIG } from "./StatusBadge";
import { useToast } from "./Toast";
import {
  Kanban,
  Table as TableIcon,
  Search,
  PlusCircle,
  ArrowUpDown,
  X,
} from "lucide-react";

interface ApplicationsViewProps {
  initialJobs: JobApplication[];
}

export default function ApplicationsView({ initialJobs }: ApplicationsViewProps) {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "company">("newest");
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);

  const { showToast } = useToast();

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

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesStatus =
          selectedStatus === "All" ||
          job.status.toLowerCase() === selectedStatus.toLowerCase();

        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          job.company.toLowerCase().includes(query) ||
          job.position.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          (job.notes && job.notes.toLowerCase().includes(query));

        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        }
        return a.company.localeCompare(b.company);
      });
  }, [jobs, searchQuery, selectedStatus, sortBy]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: jobs.length };
    Object.keys(STATUS_CONFIG).forEach((st) => {
      counts[st] = jobs.filter((j) => j.status === st).length;
    });
    return counts;
  }, [jobs]);

  const filterTabs = ["All", "Wishlist", "Applied", "Screening", "Interviewing", "Offer", "Rejected"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Applications Hub
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your opportunities across all hiring pipeline stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Link
            href="/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Application</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, title, or keywords..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-orange-600" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
          >
            <option value="newest">Newest Applied</option>
            <option value="oldest">Oldest Applied</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isSelected = selectedStatus === tab;
          const count = statusCounts[tab] || 0;

          return (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border ${
                isSelected
                  ? "bg-orange-500 border-orange-600 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`flex h-4 px-1.5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  isSelected ? "bg-orange-700/80 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main View Display */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          jobs={filteredJobs}
          onSelectJob={(job) => setSelectedJob(job)}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <JobTable
          jobs={filteredJobs}
          onSelectJob={(job) => setSelectedJob(job)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteJob={handleDeleteJob}
        />
      )}

      {/* Job Details Modal */}
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
