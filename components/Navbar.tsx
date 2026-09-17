"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  LogOut,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { useAuth } from "./AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Applications", href: "/jobs", icon: ListTodo },
  ];

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                CareerPulse
                <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Tracker
                </span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-50 text-orange-700 border border-orange-200/80 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-orange-600" : "text-slate-500"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 active:scale-98 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </Link>

          {/* Auth State in Navbar */}
          {!loading && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {user ? (
                <div className="flex items-center gap-2.5">
                  <div
                    title={user.email}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs shadow-xs">
                      {getInitials(user.name)}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="flex items-center gap-1.5 p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all text-xs font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 border border-transparent hover:border-orange-200 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/signup"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}