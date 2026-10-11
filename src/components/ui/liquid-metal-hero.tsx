"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  FileText, Activity, ShieldCheck, WifiOff, CheckCircle2, 
  ArrowRight, Languages, Mic 
} from "lucide-react";

// Dynamically import the LiquidMetal shader for client-only, lazy rendering
const LazyLiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.LiquidMetal),
  { ssr: false }
);

interface LiquidMetalHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
  features?: string[];
}

export default function LiquidMetalHero({
  badge = "Patient intake for OPDs",
  title = "Your health story, ready for your doctor.",
  subtitle = "Share symptoms, medicines, and previous reports through guided voice or touch intake. Continue even when the connection drops.",
  primaryCtaLabel = "Start patient intake",
  secondaryCtaLabel = "Staff sign in",
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = ["Voice and touch", "English and Hindi", "Offline intake"],
}: LiquidMetalHeroProps) {
  const [canRenderShader, setCanRenderShader] = useState(false);
  const [shaderProps, setShaderProps] = useState<any>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Check WebGL support
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    // Load presets dynamically with dark teal / silver tones
    import("@paper-design/shaders-react").then((mod) => {
      const preset = mod.liquidMetalPresets?.[2] || {};
      setShaderProps({
        ...preset,
        params: {
          ...(preset.params || {}),
          colorBack: "#08121B",
          colorTint: "#50D6C5",
          speed: 0.25,
        },
      });
    }).catch(() => {});

    // Use IntersectionObserver to stop/unmount shader when offscreen
    let isMounted = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (isMounted) {
            setCanRenderShader(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (illustrationRef.current) {
      observer.observe(illustrationRef.current);
    } else {
      setCanRenderShader(true);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="relative overflow-hidden bg-[#0C1924] border-b border-[#294350] py-12 sm:py-16 lg:py-20">
      {/* Subtle ambient gradient mesh behind hero */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(80,214,197,0.12),transparent)]"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Clear OPD Intake Value Proposition (lg:col-span-7) */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Small label: Patient intake for OPDs */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#50D6C5]/10 text-[#50D6C5] border border-[#50D6C5]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#50D6C5] animate-pulse" />
                {badge}
              </span>
            </motion.div>

            {/* Headline and Description */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F1F6F8] leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-[#B6C7CF] leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </motion.div>

            {/* Actions: Start patient intake and Staff sign in */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3.5 pt-2"
              variants={itemVariants}
            >
              <Button
                id="start-kiosk-btn"
                onClick={onPrimaryCtaClick}
                size="lg"
                className="bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] font-bold text-base px-7 py-3.5 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4 text-[#062820]" />
              </Button>

              {secondaryCtaLabel && onSecondaryCtaClick && (
                <Button
                  id="staff-signin-btn"
                  onClick={onSecondaryCtaClick}
                  variant="outline"
                  size="lg"
                  className="border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-[#F1F6F8] font-semibold text-base px-6 py-3.5 rounded-xl transition-all duration-150 min-h-[48px]"
                >
                  {secondaryCtaLabel}
                </Button>
              )}
            </motion.div>

            {/* Capability Badges & Operational Note */}
            <motion.div className="pt-4 border-t border-[#294350] space-y-3" variants={itemVariants}>
              <div className="flex flex-wrap gap-2.5">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#122330] border border-[#294350] text-xs font-medium text-[#F1F6F8]"
                  >
                    {idx === 0 && <Mic className="w-3.5 h-3.5 text-[#50D6C5]" />}
                    {idx === 1 && <Languages className="w-3.5 h-3.5 text-[#50D6C5]" />}
                    {idx === 2 && <WifiOff className="w-3.5 h-3.5 text-[#50D6C5]" />}
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#91A8B3] leading-normal">
                Touch input, document scan, and local drafts work uninterrupted offline. Voice transcription confirms locally before queueing.
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Dimensional Medical Record Illustration with Subtle Depth (lg:col-span-5) */}
          <motion.div
            ref={illustrationRef}
            className="lg:col-span-5 relative w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative w-full max-w-md rounded-2xl bg-[#122330] border border-[#294350] shadow-xl p-6 overflow-hidden">
              
              {/* Contained LiquidMetal Shader Layer: Confined strictly to illustration panel */}
              {canRenderShader && shaderProps ? (
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden mix-blend-screen z-0">
                  <LazyLiquidMetal
                    {...shaderProps}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                </div>
              ) : (
                /* Static accessible fallback for reduced motion, offline, or non-WebGL devices */
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40 z-0 bg-gradient-to-br from-[#18303D] via-[#122330] to-[#0C1924]"
                  aria-hidden="true"
                />
              )}

              {/* Dimensional Medical Record Visual Overlay (Z-index 10) */}
              <div className="relative z-10 space-y-4 select-none">
                {/* Clinical Header */}
                <div className="flex items-center justify-between border-b border-[#294350] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#18303D] text-[#50D6C5] flex items-center justify-center font-bold border border-[#294350]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F1F6F8] uppercase tracking-wider block">
                        Patient Intake Record
                      </span>
                      <span className="text-3xs font-mono text-[#91A8B3]">Case #MK-2026-OPD-782</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-[#50D6C5]/15 text-[#50D6C5] border border-[#50D6C5]/30">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>

                {/* Patient Summary Card */}
                <div className="p-3.5 rounded-xl bg-[#18303D] border border-[#294350] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-3xs text-[#91A8B3]">
                    <span className="text-[#B6C7CF] font-medium">Patient: Ramesh Kumar, 54 Y</span>
                    <span className="font-mono text-[#50D6C5]">Rev 1 (Monotonic)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#F1F6F8] block text-xs">Chief Complaint:</span>
                    <p className="text-[#B6C7CF] text-xs leading-relaxed mt-0.5">
                      Chest heaviness after walking, cough with mild fever for 4 days.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-3xs">
                    <span className="px-2 py-0.5 rounded bg-[#122330] border border-[#294350] text-[#B6C7CF]">Hindi / Touch Input</span>
                    <span className="px-2 py-0.5 rounded bg-[#122330] border border-[#294350] text-[#B6C7CF]">Prescription OCR Added</span>
                  </div>
                </div>

                {/* Active Safeguard Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#18303D]/60 border border-[#294350]">
                    <span className="text-[#B6C7CF] flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#50D6C5]" />
                      Encrypted at rest (AES-GCM 256)
                    </span>
                    <span className="text-[#50D6C5] font-semibold text-xs">Protected</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#261B0E] border border-[#854D0E]">
                    <span className="text-[#FBBF24] flex items-center gap-1.5 text-xs">
                      <Activity className="w-3.5 h-3.5 text-[#FBBF24]" />
                      Local red-flag rule check
                    </span>
                    <span className="text-[#FBBF24] font-semibold text-xs">Triage Flag</span>
                  </div>
                </div>

                {/* Synthetic data label as requested in prompt */}
                <div className="text-center pt-2 border-t border-[#294350]/60">
                  <span className="text-3xs text-[#91A8B3] uppercase tracking-wider font-mono">
                    Illustrative example   Synthetic patient data
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
