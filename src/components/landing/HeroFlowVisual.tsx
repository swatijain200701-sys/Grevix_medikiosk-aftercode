"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FileText, CheckCircle2, Stethoscope, ArrowRight, Sparkles } from "lucide-react";

/**
 * HeroFlowVisual — GSAP & SVG Micro-Sequence
 * Shows conversational intake data transforming into a structured, clinician-ready card.
 * Duration: ~5s, plays once, then gracefully rests.
 * Pointer-events: none, placed safely below interactive CTAs.
 * Respects prefers-reduced-motion by rendering the final structured state immediately.
 */
export function HeroFlowVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawNoteRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const structuredCardRef = useRef<HTMLDivElement>(null);
  const chip1Ref = useRef<HTMLDivElement>(null);
  const chip2Ref = useRef<HTMLDivElement>(null);
  const chip3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Under reduced motion: show final state without running animations
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        rawNoteRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          arrowRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5 },
          "+=0.2"
        )
        .fromTo(
          structuredCardRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.2"
        )
        .fromTo(
          [chip1Ref.current, chip2Ref.current, chip3Ref.current],
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, stagger: 0.25, duration: 0.6 }
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto pointer-events-none select-none py-2"
      aria-hidden="true"
    >
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        {/* Patient Free-Text Card */}
        <div
          ref={rawNoteRef}
          className="w-full sm:w-1/2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--bg-panel)] text-[var(--btn-main)] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-3xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Patient Words (Touch/Voice)
            </span>
          </div>
          <p className="text-xs text-[var(--text-heading)] font-serif italic bg-[var(--bg-panel)]/40 p-2.5 rounded-xl border border-[var(--border-color)]/60 leading-relaxed">
            &ldquo;Fever and body aches for 3 days. Taking regular BP tablets. Allergic to penicillin.&rdquo;
          </p>
          <span className="text-3xs text-[var(--btn-main)] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[var(--btn-main)]" /> Confirmed by patient
          </span>
        </div>

        {/* Arrow Transform Icon */}
        <div ref={arrowRef} className="hidden sm:flex text-[var(--slate-accent)] shrink-0">
          <div className="w-7 h-7 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-center justify-center text-[var(--btn-main)]">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Structured Clinical Intake Summary */}
        <div
          ref={structuredCardRef}
          className="w-full sm:w-1/2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-2"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--btn-main)]" />
              <span className="text-3xs font-extrabold uppercase tracking-wider text-[var(--text-heading)]">
                Structured Intake
              </span>
            </div>
            <span className="text-3xs px-1.5 py-0.5 rounded bg-[var(--bg-panel)] text-[var(--btn-main)] font-mono font-bold">
              OPD Ready
            </span>
          </div>

          <div className="space-y-1.5 text-2xs">
            <div
              ref={chip1Ref}
              className="p-1.5 rounded-lg bg-[var(--bg-panel)]/70 border border-[var(--border-color)]/70 flex justify-between items-center"
            >
              <span className="font-semibold text-[var(--text-heading)]">Concern: Acute Fever</span>
              <span className="text-3xs text-[var(--text-muted)]">3 days</span>
            </div>
            <div
              ref={chip2Ref}
              className="p-1.5 rounded-lg bg-[var(--bg-panel)]/70 border border-[var(--border-color)]/70 flex justify-between items-center"
            >
              <span className="font-semibold text-[var(--text-heading)]">History: Hypertension</span>
              <span className="text-3xs text-[var(--text-muted)]">Active meds</span>
            </div>
            <div
              ref={chip3Ref}
              className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex justify-between items-center"
            >
              <span className="font-bold">Allergy: Penicillin</span>
              <span className="text-3xs uppercase font-mono font-bold">Reported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
