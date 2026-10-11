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
        "w-full flex items-center justify-center p-2 sm:p-4",
        className
      )}
    >
      <div className="w-full max-w-4xl bg-[#122330] rounded-3xl border border-[#294350] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side: Restrained Clinical Graphic & Document Tray Illustration (md:col-span-5) */}
        <div className="hidden md:flex md:col-span-5 bg-[#0C1924] p-8 flex-col justify-between border-r border-[#294350]">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#18303D] text-[#50D6C5] flex items-center justify-center border border-[#294350] shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F6F8] tracking-tight">
                MediKiosk Clinical Portal
              </h2>
              <p className="text-xs text-[#B6C7CF] mt-1.5 leading-relaxed">
                Authorized healthcare practitioner gateway for outpatient departments and triage stations.
              </p>
            </div>
          </div>

          {/* Clinical Document Tray Card */}
          <div className="space-y-3 bg-[#18303D] p-4 rounded-2xl border border-[#294350]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#F1F6F8]">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#50D6C5]" />
                Incoming OPD Queue
              </span>
              <span className="text-3xs px-2 py-0.5 rounded-full bg-[#50D6C5]/15 text-[#50D6C5] font-mono border border-[#50D6C5]/30">Live</span>
            </div>
            <div className="space-y-2 text-xs text-[#B6C7CF]">
              <div className="p-2 rounded-lg bg-[#122330] border border-[#294350] flex justify-between">
                <span>Structured case histories</span>
                <span className="text-[#50D6C5] font-medium">Ready</span>
              </div>
              <div className="p-2 rounded-lg bg-[#122330] border border-[#294350] flex justify-between">
                <span>Red-flag attention alerts</span>
                <span className="text-[#FBBF24] font-medium">Filtered</span>
              </div>
              <div className="p-2 rounded-lg bg-[#122330] border border-[#294350] flex justify-between">
                <span>Verified uploaded reports</span>
                <span className="text-[#50D6C5] font-medium">OCR Parsed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-3xs text-[#91A8B3]">
            <ShieldCheck className="w-4 h-4 text-[#50D6C5] shrink-0" />
            <span>Audited session access   DISHA clinical data boundaries.</span>
          </div>
        </div>

        {/* Right Side: Clean Accessible Form (md:col-span-7) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#122330]">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[#B6C7CF] leading-relaxed">
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
                  className="p-3.5 rounded-xl bg-[#2B1417] border border-[#991B1B] text-[#F87171] text-xs flex items-start gap-2.5"
                  role="alert"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#F87171]" />
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
                  className="text-xs font-semibold text-[#F1F6F8] block"
                >
                  Staff Username or ID
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A8B3] pointer-events-none">
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
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] text-sm focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="staff-password"
                  className="text-xs font-semibold text-[#F1F6F8] block"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A8B3] pointer-events-none">
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
                    className="w-full h-12 pl-10 pr-10 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] text-sm focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#91A8B3] hover:text-[#F1F6F8] transition-colors"
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
                  "w-full h-12 mt-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-sm min-h-[48px]",
                  isSuccess
                    ? "bg-[#50D6C5] text-[#062820]"
                    : "bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820]"
                )}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[#062820]"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-[#062820]" />
                      <span>Verifying staff access...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-[#062820]"
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
                      className="flex items-center gap-1.5 text-[#062820]"
                    >
                      <span>Sign In to Staff Portal</span>
                      <ArrowRight className="w-4 h-4 text-[#062820]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Default test credentials hint */}
              <div className="p-3.5 rounded-xl bg-[#18303D] border border-[#294350] text-3xs text-[#B6C7CF] space-y-1.5">
                <span className="font-semibold text-[#F1F6F8] block">Authorized Demo Credentials:</span>
                <div className="flex justify-between items-center">
                  <span>Staff: <code className="bg-[#122330] px-1.5 py-0.5 rounded border border-[#294350] text-[#50D6C5]">opd_staff</code></span>
                  <span>Pass: <code className="bg-[#122330] px-1.5 py-0.5 rounded border border-[#294350] text-[#50D6C5]">clinical2026</code></span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Doctor: <code className="bg-[#122330] px-1.5 py-0.5 rounded border border-[#294350] text-[#50D6C5]">dr_sharma</code></span>
                  <span>Pass: <code className="bg-[#122330] px-1.5 py-0.5 rounded border border-[#294350] text-[#50D6C5]">opd@medikiosk</code></span>
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
