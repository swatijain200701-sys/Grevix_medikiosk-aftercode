"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  FileText, Activity, ShieldCheck, WifiOff, CheckCircle2, 
  ArrowRight, Languages, Mic, MessageSquare, ExternalLink,
  AlertCircle, Check
} from "lucide-react";

const LazyLiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.LiquidMetal),
  { ssr: false }
);

interface LiquidMetalHeroProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  onPrimaryCtaClick: () => void;
  onSecondaryCtaClick?: () => void;
  feedbackUrl?: string;
  features?: string[];
}

export default function LiquidMetalHero({
  badge = "Patient history. Prepared for your consultation.",
  title = "Help your doctor understand your health history before you meet.",
  subtitle = "Share your symptoms, medicines, allergies, and previous reports through guided questions. Review your answers before sending them for staff review.",
  primaryCtaLabel = "Start patient intake",
  secondaryCtaLabel = "Staff sign in",
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  feedbackUrl = "https://forms.gle/UM6smWDSmxzCiAwh6",
  features = ["Voice and touch", "English and Hindi", "Saved offline progress"],
}: LiquidMetalHeroProps) {
  const [canRenderShader, setCanRenderShader] = useState(false);
  const [shaderProps, setShaderProps] = useState<any>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    import("@paper-design/shaders-react").then((mod) => {
      const preset = mod.liquidMetalPresets?.[2] || {};
      setShaderProps({
        ...preset,
        params: {
          ...(preset.params || {}),
          colorBack: "#FAF7F0",
          colorTint: "#356B62",
          speed: 0.15,
        },
      });
    }).catch(() => {});

    let isMounted = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (isMounted) setCanRenderShader(entry.isIntersecting);
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

  return (
    <section className="relative overflow-hidden bg-[#EAF0EB] border-b border-[#B8C9BD] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Small Notice: Public testing version */}
        <div className="mb-6 p-3 rounded-xl bg-[#D8E5DC] border border-[#B8C9BD] text-xs text-[#293D36] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#356B62] shrink-0" />
            <span>
              <strong>Public testing version:</strong> Please use fictional test information. AI summaries support hospital staff review and do not provide medical diagnosis or treatment.
            </span>
          </div>
          <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-[#FAF7F0] text-[#356B62] border border-[#B8C9BD]">
            Public Testing Version
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D8E5DC] text-[#356B62] border border-[#B8C9BD]">
                {badge}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#293D36] leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-[#53665D] leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>

            <ul className="space-y-2 text-sm text-[#293D36] font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#356B62]" />
                <span>Explain your concern in your own words.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#356B62]" />
                <span>Keep your health information organised in one intake record.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#356B62]" />
                <span>Help staff prepare for your consultation.</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Button
                id="start-kiosk-btn"
                onClick={onPrimaryCtaClick}
                size="lg"
                className="bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-sm min-h-[48px]"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4 text-[#FFFDF7]" />
              </Button>

              {secondaryCtaLabel && onSecondaryCtaClick && (
                <Button
                  id="sample-staff-btn"
                  onClick={onSecondaryCtaClick}
                  variant="outline"
                  size="lg"
                  className="border-[#B8C9BD] bg-[#FAF7F0] hover:bg-[#D8E5DC] text-[#293D36] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl min-h-[48px]"
                >
                  {secondaryCtaLabel}
                </Button>
              )}
            </div>
          </div>

          <div
            ref={illustrationRef}
            className="lg:col-span-5 relative w-full flex justify-center"
          >
            <div className="relative w-full max-w-md rounded-2xl bg-[#FAF7F0] border border-[#B8C9BD] shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#B8C9BD] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D8E5DC] text-[#356B62] flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#293D36] uppercase tracking-wider block">
                      Example intake record
                    </span>
                    <span className="text-3xs font-mono text-[#53665D]">Sample Record #EX-782</span>
                  </div>
                </div>
                <span className="text-3xs font-bold px-2.5 py-0.5 rounded-full bg-[#304652]/10 text-[#304652]">
                  Example Preview
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#D8E5DC]/60 border border-[#B8C9BD] space-y-2 text-xs">
                <div className="flex justify-between items-center text-3xs text-[#53665D]">
                  <span className="font-bold text-[#293D36]">Patient: Ramesh Kumar, 54 Y</span>
                  <span className="font-mono text-[#356B62]">Saved draft</span>
                </div>
                <div>
                  <span className="font-bold text-[#293D36] block text-xs">Chief Complaint:</span>
                  <p className="text-[#53665D] text-xs leading-relaxed mt-0.5">
                    Chest heaviness after walking, cough with mild fever for 4 days.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F0] border border-[#B8C9BD]">
                  <span className="text-[#293D36] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#356B62]" />
                    Encrypted on device terminal
                  </span>
                  <span className="text-[#304652] font-semibold text-3xs">Device Secured</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F0] border border-[#B8C9BD]">
                  <span className="text-[#293D36] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#356B62]" />
                    Clinical attention prompt
                  </span>
                  <span className="text-[#304652] font-semibold text-3xs">Staff Flag</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-[#B8C9BD]">
                <span className="text-3xs text-[#53665D] uppercase tracking-wider font-mono">
                  Illustrative example — Synthetic patient data
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}