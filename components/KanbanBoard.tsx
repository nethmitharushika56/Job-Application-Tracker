"use client";

import React from "react";
import { JobApplication, JobStatus } from "@/lib/jobs";
import StatusBadge, { STATUS_CONFIG } from "./StatusBadge";
import {
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Eye,
  MapPin,
  Clock,
} from "lucide-react";

interface KanbanBoardProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: JobStatus) => Promise<void>;
}

const COLUMNS: { status: JobStatus; title: string; color: string }[] = [
  { status: "Wishlist", title: "Wishlist", color: "border-orange-400" },
  { status: "Applied", title: "Applied", color: "border-slate-400" },
  { status: "Screening", title: "Screening", color: "border-amber-500" },
  { status: "Interviewing", title: "Interviewing", color: "border-orange-500" },
  { status: "Offer", title: "Offer", color: "border-emerald-500" },
  { status: "Rejected", title: "Rejected", color: "border-rose-400" },
];

const STAGE_ORDER: JobStatus[] = [
  "Wishlist",
  "Applied",
  "Screening",
  "Interviewing",
  "Offer",
];

export default function KanbanBoard({
  jobs,
  onSelectJob,
  onUpdateStatus,
}: KanbanBoardProps) {
  const getNextStatus = (current: JobStatus): JobStatus | null => {
    const currentIndex = STAGE_ORDER.indexOf(current);
    if (currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1) {
      return STAGE_ORDER[currentIndex + 1];
    }
    return null;
  };

  const getPrevStatus = (current: JobStatus): JobStatus | null => {
    const currentIndex = STAGE_ORDER.indexOf(current);
    if (currentIndex > 0) {
      return STAGE_ORDER[currentIndex - 1];
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnJobs = jobs.filter((j) => j.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col rounded-2xl bg-slate-100/70 border border-slate-200/90 p-3.5 min-h-[400px]"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3 border-b-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800">{col.title}</h3>
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-xs">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="mt-3 flex-1 flex flex-col gap-3">
              {columnJobs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-300 rounded-xl p-4 text-center bg-white/40">
                  <p className="text-xs font-medium text-slate-400">No applications</p>
                </div>
              ) : (
                columnJobs.map((job) => {
                  const nextStatus = getNextStatus(job.status);
                  const prevStatus = getPrevStatus(job.status);

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className="group relative flex flex-col gap-2 rounded-xl bg-white hover:border-orange-400 border border-slate-200/90 p-3.5 shadow-xs hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block truncate">
                            {job.company}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight mt-0.5 group-hover:text-orange-700 transition-colors line-clamp-2">
                            {job.position}
                          </h4>
                        </div>
                      </div>

                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[90px]">{job.workplaceType}</span>
                        </span>
                        {job.salary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            <span className="truncate max-w-[85px]">{job.salary}</span>
                          </span>
                        )}
                      </div>

                      {/* Date / Follow-up */}
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {job.appliedDate}
                        </span>

                        {job.interviewDate && (
                          <span className="flex items-center gap-1 text-orange-600 font-bold">
                            <Clock className="w-3 h-3" />
                            Interview
                          </span>
                        )}
                      </div>

                      {/* Quick stage mover controls */}
                      <div
                        className="flex items-center justify-between pt-1.5 border-t border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevStatus ? (
                          <button
                            onClick={() => onUpdateStatus(job.id, prevStatus)}
                            title={`Move back to ${prevStatus}`}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div />
                        )}

                        <button
                          onClick={() => onSelectJob(job)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 py-0.5 px-2 rounded-md hover:bg-orange-50 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Details
                        </button>

                        {nextStatus ? (
                          <button
                            onClick={() => onUpdateStatus(job.id, nextStatus)}
                            title={`Advance to ${nextStatus}`}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
