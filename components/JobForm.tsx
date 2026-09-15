"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { JobStatus, JobType, WorkplaceType } from "@/lib/jobs";
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Globe,
  User,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface JobFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export default function JobForm({ initialData, isEditing = false, onSuccess }: JobFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [company, setCompany] = useState(initialData?.company || "");
  const [position, setPosition] = useState(initialData?.position || "");
  const [status, setStatus] = useState<JobStatus>(initialData?.status || "Applied");
  const [jobType, setJobType] = useState<JobType>(initialData?.jobType || "Full-time");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(
    initialData?.workplaceType || "Remote"
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [salary, setSalary] = useState(initialData?.salary || "");
  const [appliedDate, setAppliedDate] = useState(
    initialData?.appliedDate || new Date().toISOString().split("T")[0]
  );
  const [followUpDate, setFollowUpDate] = useState(initialData?.followUpDate || "");
  const [interviewDate, setInterviewDate] = useState(initialData?.interviewDate || "");
  const [jobUrl, setJobUrl] = useState(initialData?.jobUrl || "");
  const [contactName, setContactName] = useState(initialData?.contactName || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || "");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">(
    initialData?.priority || "High"
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!company.trim() || !position.trim()) {
      showToast("Please provide both Company and Position title.", "error");
      return;
    }

    setLoading(true);

    const payload = {
      company: company.trim(),
      position: position.trim(),
      status,
      jobType,
      workplaceType,
      location: location.trim() || (workplaceType === "Remote" ? "Remote" : "Headquarters"),
      salary: salary.trim(),
      appliedDate,
      followUpDate: followUpDate || undefined,
      interviewDate: interviewDate || undefined,
      jobUrl: jobUrl.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      priority,
      notes: notes.trim(),
    };

    try {
      const url = isEditing ? `/api/jobs/${initialData.id}` : "/api/jobs";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save application");
      }

      showToast(
        isEditing
          ? "Application updated successfully!"
          : `Application for ${company} added!`,
        "success"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/jobs");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      showToast("Something went wrong while saving. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-md"
    >
      <div className="space-y-6">
        {/* Core details section */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Position & Company
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. OpenAI, Stripe, Linear"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Role / Position Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stage, Type & Workplace */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Stage & Work Type
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="Wishlist">Wishlist (Planning)</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening Call</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer Received 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Ghosted">Ghosted / No Reply</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Workplace Setup
              </label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Salary / Target Compensation
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $140,000 - $160,000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & Important dates */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Key Dates & Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Application Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Follow-up By
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
              >
                <option value="High">🔥 High Priority (Dream Job)</option>
                <option value="Medium">⚡ Medium Priority</option>
                <option value="Low">🌱 Low / Backup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Job Posting URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://jobs.lever.co/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Recruiter / Contact Person
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Doe (Tech Recruiter)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Interview preparation */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes & Next Steps
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Application Notes, Interview Prep & Feedback
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key skills highlighted, referral notes, interview round details, questions to ask..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/jobs"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Back
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition-all active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <span>Saving Application...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? "Update Application" : "Save Application"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}