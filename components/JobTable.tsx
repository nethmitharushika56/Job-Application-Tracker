"use client";

import React, { useState } from "react";
import { JobApplication, JobStatus } from "@/lib/jobs";
import { STATUS_CONFIG } from "./StatusBadge";
import {
  Building2,
  Eye,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface JobTableProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: JobStatus) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
}

export default function JobTable({
  jobs,
  onSelectJob,
  onUpdateStatus,
  onDeleteJob,
}: JobTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    jobId: string
  ) => {
    e.stopPropagation();
    const newStatus = e.target.value as JobStatus;
    setUpdatingId(jobId);
    try {
      await onUpdateStatus(jobId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, job: JobApplication) => {
    e.stopPropagation();
    if (window.confirm(`Delete application for ${job.company}?`)) {
      await onDeleteJob(job.id);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No applications match your criteria</h3>
        <p className="text-sm text-slate-500 mt-1">
          Try clearing your search or status filters to view applications.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-6 py-4">Company & Position</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Type & Location</th>
              <th className="px-6 py-4">Salary</th>
              <th className="px-6 py-4">Applied Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="group hover:bg-orange-50/40 transition-colors cursor-pointer"
              >
                {/* Company & Position */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-sm shadow-xs">
                      {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                        {job.company}
                      </span>
                      <div className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                        {job.position}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Dropdown */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-block">
                    <select
                      value={job.status}
                      disabled={updatingId === job.id}
                      onChange={(e) => handleStatusChange(e, job.id)}
                      className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-xs cursor-pointer"
                    >
                      {Object.keys(STATUS_CONFIG).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Type & Location */}
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">{job.workplaceType}</span>
                    <span className="text-slate-400"> • {job.jobType}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                    {job.location}
                  </div>
                </td>

                {/* Salary */}
                <td className="px-6 py-4">
                  {job.salary ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {job.salary}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                {/* Applied Date */}
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600 font-medium">{job.appliedDate}</span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelectJob(job)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Open Job Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, job)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
