"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, EyeOff, Lock, User, Loader2, Check, 
  ShieldAlert, Stethoscope, ArrowRight, ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StaffLoginProps {
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
  className?: string;
}

export function StaffLogin({
  title = "Staff sign in",
  subtitle = "Review patient intake and prepare for consultations.",
  onSuccess,
  className,
}: StaffLoginProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Please verify your staff credentials.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard");
        }
      }, 700);
    } catch {
      setErrorMessage("Network error connecting to hospital authentication service.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto rounded-3xl bg-[#FAF7F0] border border-[#B8C9BD] shadow-xl overflow-hidden text-[#293D36]",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        
        {/* Left Side: Navy Brand Panel (md:col-span-5) */}
        <div className="md:col-span-5 bg-[#0B1B25] text-[#FFFDF7] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#304652]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-lg shadow-sm">
                <Stethoscope className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#FAF7F0] block">
                  MediKiosk
                </span>
                <span className="text-3xs text-[#91A8B3] uppercase tracking-wider block font-semibold">
                  Clinical Staff Portal
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-xl font-bold tracking-tight text-[#FAF7F0]">
                Hospital Staff Intake Review
              </h2>
              <p className="text-xs text-[#91A8B3] leading-relaxed">
                Inspect submitted patient histories, review structured summaries and source excerpts, and record clinical notes before consultation.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs text-[#B6C7CF]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4FD1C5]" />
                <span>Encrypted record transport</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4FD1C5]" />
                <span>Authoritative source grounding</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#4FD1C5]" />
                <span>Audited clinical staff session</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-3xs text-[#91A8B3] pt-6">
            <ShieldCheck className="w-4 h-4 text-[#4FD1C5] shrink-0" />
            <span>Audited session access — strict patient data boundary.</span>
          </div>
        </div>

        {/* Right Side: Clean Accessible Form (md:col-span-7) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#FAF7F0]">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293D36] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[#53665D] leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] text-xs font-semibold flex items-start gap-2.5"
                  role="alert"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                  <span className="leading-snug">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="staff-username"
                  className="text-xs font-bold text-[#293D36] block"
                >
                  Staff Username or ID
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#53665D] pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="staff-username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="e.g. opd_staff or dr_sharma"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36] placeholder-[#53665D] text-sm focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="staff-password"
                  className="text-xs font-bold text-[#293D36] block"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#53665D] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-10 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36] placeholder-[#53665D] text-sm focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#53665D] hover:text-[#293D36] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="staff-login-submit-btn"
                type="submit"
                disabled={isLoading || isSuccess}
                className={cn(
                  "w-full h-12 mt-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-sm min-h-[48px]",
                  "bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] disabled:opacity-50"
                )}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[#FFFDF7]"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying staff access...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-[#FFFDF7]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Access Granted</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-[#FFFDF7]"
                    >
                      <span>Sign In to Staff Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Demo credentials hint */}
              <div className="p-3.5 rounded-xl bg-[#D8E5DC] border border-[#B8C9BD] text-3xs text-[#293D36] space-y-1.5">
                <span className="font-bold text-[#293D36] block">Authorized Demo Credentials:</span>
                <div className="flex justify-between items-center">
                  <span>Staff: <code className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#B8C9BD] text-[#356B62] font-bold">opd_staff</code></span>
                  <span>Pass: <code className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#B8C9BD] text-[#356B62] font-bold">clinical2026</code></span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Doctor: <code className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#B8C9BD] text-[#356B62] font-bold">dr_sharma</code></span>
                  <span>Pass: <code className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#B8C9BD] text-[#356B62] font-bold">opd@medikiosk</code></span>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StaffLogin;