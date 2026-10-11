"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, EyeOff, Lock, User, Loader2, Check, 
  ShieldAlert, Stethoscope, FileText, ArrowRight, ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StaffLoginProps {
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
  className?: string;
}

export function StaffLogin({
  title = "Staff access",
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
    } catch (err) {
      setErrorMessage("Network error connecting to the hospital authentication server.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[#F7FAF9] text-[#334155] flex items-center justify-center p-4 sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#DCE7E4] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side: Calm Healthcare Graphic & Document Tray Illustration (md:col-span-5) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#E8F3EF] to-[#F7FAF9] p-8 flex-col justify-between border-r border-[#DCE7E4]">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#17343A] tracking-tight">
                MediKiosk Clinical Portal
              </h2>
              <p className="text-xs text-[#52656B] mt-1 leading-relaxed">
                Authorized healthcare practitioner gateway for outpatient departments and triage stations.
              </p>
            </div>
          </div>

          {/* Clinical Document Tray Card */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#DCE7E4] shadow-2xs">
            <div className="flex items-center justify-between text-2xs font-semibold text-[#17343A]">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                Incoming OPD Queue
              </span>
              <span className="text-3xs px-2 py-0.5 rounded-full bg-[#E8F3EF] text-[#0F766E]">Live</span>
            </div>
            <div className="space-y-2 text-2xs text-[#52656B]">
              <div className="p-2 rounded-lg bg-[#F7FAF9] border border-[#DCE7E4]/60 flex justify-between">
                <span>Structured case histories</span>
                <span className="text-[#0F766E] font-medium">Ready</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7FAF9] border border-[#DCE7E4]/60 flex justify-between">
                <span>Red-flag attention alerts</span>
                <span className="text-amber-700 font-medium">Filtered</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7FAF9] border border-[#DCE7E4]/60 flex justify-between">
                <span>Verified uploaded reports</span>
                <span className="text-[#0F766E] font-medium">OCR Parsed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-3xs text-[#52656B]">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>Audited session access   HIPAA/DISHA compliant data boundaries.</span>
          </div>
        </div>

        {/* Right Side: Clean Accessible Form (md:col-span-7) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17343A] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[#52656B] leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 text-[#991B1B] text-xs flex items-start gap-2.5"
                  role="alert"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
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
                  className="text-xs font-semibold text-[#17343A] block"
                >
                  Staff Username or ID
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52656B] pointer-events-none">
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
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE7E4] bg-white text-[#17343A] placeholder-[#52656B]/60 text-sm focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="staff-password"
                  className="text-xs font-semibold text-[#17343A] block"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52656B] pointer-events-none">
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
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#DCE7E4] bg-white text-[#17343A] placeholder-[#52656B]/60 text-sm focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#52656B] hover:text-[#17343A] transition-colors"
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
              <motion.button
                id="staff-login-submit-btn"
                type="submit"
                disabled={isLoading || isSuccess}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full h-11 mt-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-sm",
                  isSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-600/25"
                    : "bg-[#0F766E] hover:bg-[#115E59] active:bg-[#115E59] text-white"
                )}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying staff access...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-white"
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
                      className="flex items-center gap-1.5"
                    >
                      <span>Sign In to Staff Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Default test credentials hint */}
              <div className="p-3 rounded-xl bg-[#F7FAF9] border border-[#DCE7E4] text-3xs text-[#52656B] space-y-1">
                <span className="font-semibold text-[#17343A] block">Authorized Demo Credentials:</span>
                <div className="flex justify-between">
                  <span>Username: <code className="bg-white px-1 py-0.5 rounded border border-[#DCE7E4] text-[#0F766E]">opd_staff</code></span>
                  <span>Password: <code className="bg-white px-1 py-0.5 rounded border border-[#DCE7E4] text-[#0F766E]">clinical2026</code></span>
                </div>
                <div className="flex justify-between">
                  <span>Doctor: <code className="bg-white px-1 py-0.5 rounded border border-[#DCE7E4] text-[#0F766E]">dr_sharma</code></span>
                  <span>Password: <code className="bg-white px-1 py-0.5 rounded border border-[#DCE7E4] text-[#0F766E]">opd@medikiosk</code></span>
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
