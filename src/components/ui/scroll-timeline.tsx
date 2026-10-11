"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface Milestone {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  date?: string;
}

export interface TimelineProps {
  milestones: Milestone[];
  className?: string;
}

export function ScrollTimeline({ milestones = [], className }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const milestoneRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const updatePositions = useCallback(() => {
    if (!containerRef.current || milestones.length === 0) return;

    if (prefersReducedMotion) {
      setScrollProgress(1);
      setActiveIndices(milestones.map((_, i) => i));
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.6; // Trigger near middle of viewport

    const scrolledPast = triggerPoint - containerRect.top;
    const totalHeight = containerRect.height || 1;

    let progress = scrolledPast / totalHeight;
    progress = Math.max(0, Math.min(1, progress));
    setScrollProgress(progress);

    // Measure milestone positions dynamically rather than assuming equal spacing
    const newActive: number[] = [];
    milestoneRefs.current.forEach((el, index) => {
      if (el) {
        const itemRect = el.getBoundingClientRect();
        // Item is reached when its top enters the trigger zone
        if (itemRect.top <= triggerPoint + 20) {
          newActive.push(index);
        }
      }
    });
    setActiveIndices(newActive);
  }, [milestones, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePositions();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial calculation
    updatePositions();

    // ResizeObserver for layout changes
    let observer: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updatePositions();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (observer) observer.disconnect();
    };
  }, [updatePositions]);

  // Handle 0 or 1 milestone safely
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full max-w-4xl mx-auto px-4 py-8 relative", className)}
    >
      <div className="relative">
        
        {/* Background Track Line (faded clinical teal-gray) */}
        <div
          className="absolute left-4 md:left-1/2 top-3 bottom-6 w-[2px] bg-[#DCE7E4] -translate-x-1/2"
          aria-hidden="true"
        />

        {/* Animated Progress Line (Muted teal #0F766E) */}
        <div
          className="absolute left-4 md:left-1/2 top-3 w-[2px] bg-[#0F766E] -translate-x-1/2 transition-[height] duration-150 ease-out z-0"
          style={{ height: `${scrollProgress * 100}%`, maxHeight: "calc(100% - 24px)" }}
          aria-hidden="true"
        />

        {/* Semantic Ordered List */}
        <ol className="flex flex-col gap-10 md:gap-14 relative z-10 list-none p-0 m-0">
          {milestones.map((milestone, index) => {
            const isReached = activeIndices.includes(index) || prefersReducedMotion;
            const isEven = index % 2 === 0;

            const dotClasses = isReached
              ? "border-[#0F766E] bg-white text-[#0F766E] shadow-sm scale-110"
              : "border-[#DCE7E4] bg-[#F7FAF9] text-[#52656B] scale-100";

            return (
              <li
                key={milestone.id}
                ref={(el) => {
                  milestoneRefs.current[index] = el;
                }}
                className={cn(
                  "relative flex flex-col md:flex-row items-start w-full group",
                  isEven ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Clinical Step Marker Dot */}
                <div
                  className={cn(
                    "absolute left-4 md:left-1/2 top-1.5 w-7 h-7 rounded-full border-2 -translate-x-1/2 flex items-center justify-center font-bold text-3xs font-mono transition-all duration-300 z-20",
                    dotClasses
                  )}
                  aria-hidden="true"
                >
                  {milestone.stepNumber}
                </div>

                {/* Desktop Spacer (balances alternate sides on md screens) */}
                <div className="hidden md:block w-1/2" aria-hidden="true" />

                {/* Milestone Content Card: Always fully readable! */}
                <div
                  className={cn(
                    "w-full md:w-1/2 pl-12 md:pl-0 transition-all duration-500 ease-out",
                    isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                  )}
                >
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-md border border-[#DCE7E4] bg-white text-3xs font-mono font-semibold tracking-wider text-[#0F766E] shadow-2xs">
                    <span>STEP {milestone.stepNumber}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#17343A]">
                    {milestone.title}
                  </h3>

                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#334155]">
                    {milestone.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

      </div>
    </div>
  );
}

export default ScrollTimeline;
