import React from "react";
import { JobStatus } from "@/lib/jobs";

export const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  Wishlist: {
    label: "Wishlist",
    bg: "bg-orange-50/80",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  Applied: {
    label: "Applied",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
  },
  Screening: {
    label: "Screening",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Interviewing: {
    label: "Interviewing",
    bg: "bg-orange-100/70",
    text: "text-orange-800",
    border: "border-orange-300",
    dot: "bg-orange-600",
  },
  Offer: {
    label: "Offer",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  Ghosted: {
    label: "Ghosted",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function StatusBadge({
  status,
  size = "md",
}: {
  status: JobStatus;
  size?: "sm" | "md" | "lg";
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
