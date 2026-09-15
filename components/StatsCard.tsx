import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "indigo" | "emerald" | "amber" | "purple" | "cyan" | "rose" | "orange";
  trend?: string;
}

const COLOR_MAP = {
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    pill: "text-orange-700 bg-orange-50",
  },
  indigo: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    pill: "text-orange-700 bg-orange-50",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    pill: "text-emerald-700 bg-emerald-50",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    pill: "text-amber-700 bg-amber-50",
  },
  purple: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    pill: "text-orange-700 bg-orange-50",
  },
  cyan: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    pill: "text-emerald-700 bg-emerald-50",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    pill: "text-rose-700 bg-rose-50",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "orange",
  trend,
}: StatsCardProps) {
  const theme = COLOR_MAP[color] || COLOR_MAP.orange;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {value}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.bg} border ${theme.border} ${theme.text} shadow-xs`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold px-2 py-0.5 rounded-full border ${theme.border} ${theme.pill}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
