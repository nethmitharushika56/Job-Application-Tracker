"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/Toast";
import {
  Briefcase,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { user, signup } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (name.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await signup(name.trim(), email.trim(), password);
      if (res.success) {
        showToast("Account created successfully! Welcome to CareerPulse.", "success");
        router.push("/");
      } else {
        setErrorMessage(res.error || "Failed to create account. Please try again.");
        showToast(res.error || "Signup error", "error");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-xl shadow-orange-500/10 border border-slate-200 bg-white">
        {/* Left Side: Brand Showcase */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-orange-700/30 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-md">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">CareerPulse</span>
            </Link>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Join CareerPulse Free</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight">
                Take control of your job applications today.
              </h2>
              <p className="text-sm text-orange-100 leading-relaxed">
                Create an account to keep your job search synced across devices with secure cloud storage.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-white/20">
            <div className="flex items-center gap-2 text-xs text-orange-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Track unlimited applications & interviews</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-orange-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Secure password hashing & encrypted cookies</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-orange-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Free instant CSV data export anytime</span>
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Start tracking your applications in seconds.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-slate-400 font-normal">(min 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-orange-600 hover:text-orange-700 transition-colors underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
