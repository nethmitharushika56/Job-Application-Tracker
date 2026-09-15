"use client";

import React, { useState } from "react";
import { JobApplication, JobStatus } from "@/lib/jobs";
import StatusBadge, { STATUS_CONFIG } from "./StatusBadge";
import {
  X,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Mail,
  User,
  Trash2,
  Clock,
  Edit3,
  Check,
} from "lucide-react";

interface JobDetailModalProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: JobStatus) => Promise<void>;
  onUpdateNotes: (id: string, newNotes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function JobDetailModal({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onDelete,
}: JobDetailModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(job?.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (job) {
      setNotes(job.notes || "");
      setIsEditingNotes(false);
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as JobStatus;
    setIsUpdating(true);
    try {
      await onUpdateStatus(job.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await onUpdateNotes(job.id, notes);
      setIsEditingNotes(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete application for ${job.company}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(job.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 md:p-8 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 rounded-xl p-1.5 transition-colors hover:bg-slate-100"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold text-lg shadow-sm">
              {job.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {job.position}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
                <span className="font-bold text-orange-600">{job.company}</span>
                <span>•</span>
                <span>{job.jobType}</span>
                <span>•</span>
                <span>{job.workplaceType}</span>
              </div>
            </div>
          </div>

          {/* Quick status updater */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-orange-800 tracking-wider">
                Current Stage:
              </span>
              <StatusBadge status={job.status} size="md" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Move to:</span>
              <select
                value={job.status}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs cursor-pointer"
              >
                {Object.keys(STATUS_CONFIG).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500">Location</p>
              <p className="text-slate-900 font-semibold">{job.location || "Not specified"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500">Compensation</p>
              <p className="text-emerald-700 font-bold">{job.salary || "Not specified"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500">Applied Date</p>
              <p className="text-slate-900 font-semibold">{job.appliedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500">Next Follow-up / Interview</p>
              <p className="text-slate-900 font-semibold">
                {job.interviewDate
                  ? new Date(job.interviewDate).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : job.followUpDate || "None scheduled"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact & URL info */}
        <div className="mt-4 space-y-3">
          {job.jobUrl && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-600">Job Posting Link</span>
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold underline-offset-4 hover:underline"
              >
                <span>View Job Description</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {(job.contactName || job.contactEmail) && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Point of Contact
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {job.contactName && (
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{job.contactName}</span>
                  </div>
                )}
                {job.contactEmail && (
                  <a
                    href={`mailto:${job.contactEmail}`}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{job.contactEmail}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Interview Notes & Prep</span>
            </h3>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Notes
              </button>
            ) : (
              <button
                onClick={handleSaveNotes}
                disabled={isUpdating}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save Notes
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-2xl bg-white border border-orange-300 p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400 shadow-xs"
              placeholder="Add key notes, recruiter feedback, technical questions asked, etc."
            />
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[70px]">
              {notes || (
                <span className="italic text-slate-400">
                  No notes added yet. Click &quot;Edit Notes&quot; to add details.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Application"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
