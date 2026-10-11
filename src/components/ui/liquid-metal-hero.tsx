"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  FileText, Activity, ShieldCheck, WifiOff, CheckCircle2, 
  Sparkles, ArrowRight, Stethoscope, Languages, Mic 
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
  subtitle = "Share your symptoms, medicines, and previous reports through a guided voice or touch experience—even when the connection drops.",
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

    // Load presets dynamically
    import("@paper-design/shaders-react").then((mod) => {
      const preset = mod.liquidMetalPresets?.[2] || {};
      setShaderProps({
        ...preset,
        params: {
          ...(preset.params || {}),
          colorBack: "#DCE7E4",
          colorTint: "#0F766E",
          speed: 0.3,
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
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative w-full bg-[#F7FAF9] text-[#334155] py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#DCE7E4] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Message, CTAs, Capability Labels (lg:col-span-7) */}
          <motion.div
            className="lg:col-span-7 space-y-6 sm:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {badge && (
              <motion.div variants={itemVariants} className="flex items-center">
                <Badge
                  variant="secondary"
                  className="bg-[#E8F3EF] text-[#0F766E] border border-[#0F766E]/20 px-3.5 py-1 text-xs font-semibold rounded-full flex items-center gap-2 shadow-2xs"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#0F766E]" />
                  {badge}
                </Badge>
              </motion.div>
            )}

            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17343A] leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-[#52656B] leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </motion.div>

            {/* Actions: Always visible on mobile without scrolling */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3.5 pt-2"
              variants={itemVariants}
            >
              <Button
                id="start-kiosk-btn"
                onClick={onPrimaryCtaClick}
                size="lg"
                className="bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-base px-7 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              {secondaryCtaLabel && onSecondaryCtaClick && (
                <Button
                  id="staff-signin-btn"
                  onClick={onSecondaryCtaClick}
                  variant="outline"
                  size="lg"
                  className="border-[#DCE7E4] bg-white hover:bg-[#E8F3EF] text-[#17343A] font-semibold text-base px-6 py-3.5 rounded-xl transition-all duration-200 shadow-2xs"
                >
                  {secondaryCtaLabel}
                </Button>
              )}
            </motion.div>

            {/* Capability Pills & Architectural Clarification */}
            <motion.div className="pt-4 border-t border-[#DCE7E4]/60 space-y-3" variants={itemVariants}>
              <div className="flex flex-wrap gap-2.5">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#DCE7E4] text-xs font-medium text-[#17343A] shadow-2xs"
                  >
                    {idx === 0 && <Mic className="w-3.5 h-3.5 text-[#0F766E]" />}
                    {idx === 1 && <Languages className="w-3.5 h-3.5 text-[#0F766E]" />}
                    {idx === 2 && <WifiOff className="w-3.5 h-3.5 text-[#0F766E]" />}
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <p className="text-2xs text-[#52656B] leading-normal">
                * Touch input and document review operate fully offline. Speech recognition uses available browser speech engines or queues raw voice recordings securely for deferred server transcription.
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Dimensional Medical History Sheet with Contained Fluid Texture (lg:col-span-5) */}
          <motion.div
            ref={illustrationRef}
            className="lg:col-span-5 relative w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#DCE7E4] shadow-md p-6 overflow-hidden">
              
              {/* Contained Shader Layer: confined strictly to this panel with low opacity and absolute positioning */}
              {canRenderShader && shaderProps ? (
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden mix-blend-multiply z-0">
                  <LazyLiquidMetal
                    {...shaderProps}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                </div>
              ) : (
                /* Static accessible fallback for reduced motion, offline, or non-WebGL devices */
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30 z-0 bg-gradient-to-br from-[#E8F3EF] via-white to-[#E8F3EF]"
                  aria-hidden="true"
                />
              )}

              {/* Dimensional Medical Record Visual Overlay (Z-index 10) */}
              <div className="relative z-10 space-y-4 select-none">
                {/* Clinical Header */}
                <div className="flex items-center justify-between border-b border-[#DCE7E4] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F3EF] text-[#0F766E] flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-2xs font-bold text-[#17343A] uppercase tracking-wider block">
                        Patient Intake Record
                      </span>
                      <span className="text-3xs font-mono text-[#52656B]">Case #MK-2026-OPD-782</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-[#E8F3EF] text-[#0F766E] border border-[#0F766E]/20">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>

                {/* Patient Summary Card */}
                <div className="p-3.5 rounded-xl bg-[#F7FAF9] border border-[#DCE7E4] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-2xs text-[#52656B]">
                    <span>Patient: Ramesh Kumar, 54 Y</span>
                    <span className="font-mono">Rev 1 (Monotonic)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#17343A] block">Chief Complaint:</span>
                    <p className="text-[#334155] text-xs">
                      Chest heaviness after walking, cough with fever for 4 days.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-2xs text-[#52656B]">
                    <span className="px-2 py-0.5 rounded bg-white border border-[#DCE7E4]">Hindi / Touch Input</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-[#DCE7E4]">Prescription OCR Added</span>
                  </div>
                </div>

                {/* Active Safeguard Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-2xs p-2 rounded-lg bg-white border border-[#DCE7E4]">
                    <span className="text-[#52656B] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                      Encrypted at rest (AES-GCM 256)
                    </span>
                    <span className="text-[#0F766E] font-semibold">Protected</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs p-2 rounded-lg bg-white border border-[#DCE7E4]">
                    <span className="text-[#52656B] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
                      Local red-flag rule check
                    </span>
                    <span className="text-amber-700 font-semibold">Triage Alert Noted</span>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="text-center pt-2">
                  <span className="text-3xs text-[#52656B]">
                    * Prepared for OPD physician review prior to consultation
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
