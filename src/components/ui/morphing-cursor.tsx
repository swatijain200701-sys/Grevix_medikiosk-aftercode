"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface MagneticTextProps {
  text: string;
  hoverText?: string;
  className?: string;
}

export function MagneticText({
  text = "CREATIVE",
  hoverText = "EXPLORE",
  className,
}: MagneticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const innerTextRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Update container size on mount / resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [text, hoverText]);

  // IntersectionObserver to pause when off-screen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Bounded animation loop: runs ONLY when active (hovered or focused) AND visible AND not reduced motion
  useEffect(() => {
    const isActive = (isHovered || isFocused) && isVisible && !prefersReducedMotion;

    if (!isActive) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.15);
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.15);

      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
      }

      if (innerTextRef.current) {
        innerTextRef.current.style.transform = `translate(${-currentPos.current.x}px, ${-currentPos.current.y}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isHovered, isFocused, isVisible, prefersReducedMotion]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePos.current = { x, y };
    currentPos.current = { x, y };
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (containerRef.current) {
      const centerX = containerRef.current.offsetWidth / 2;
      const centerY = containerRef.current.offsetHeight / 2;
      mousePos.current = { x: centerX, y: centerY };
      currentPos.current = { x: centerX, y: centerY };
    }
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const showHoverEffect = (isHovered || isFocused) && !prefersReducedMotion;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`${text}. Hover or focus to reveal: ${hoverText}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "relative inline-flex items-center justify-center select-none cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xl px-4 py-2",
        className
      )}
    >
      {/* Base text layer - fully accessible for screen readers & touch */}
      <span className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-[var(--text-heading)] transition-colors">
        {text}
      </span>

      {/* Decorative lens morphing layer - aria-hidden to ensure screen reader clarity */}
      {!prefersReducedMotion && (
        <div
          ref={circleRef}
          aria-hidden="true"
          className="absolute top-0 left-0 pointer-events-none rounded-full bg-[var(--royal-teal,#176C72)] overflow-hidden shadow-lg transition-[width,height] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
          style={{
            width: showHoverEffect ? 160 : 0,
            height: showHoverEffect ? 160 : 0,
            willChange: showHoverEffect ? "transform, width, height" : "auto",
          }}
        >
          <div
            ref={innerTextRef}
            className="absolute flex items-center justify-center"
            style={{
              width: containerSize.width || "auto",
              height: containerSize.height || "auto",
              top: "50%",
              left: "50%",
              willChange: showHoverEffect ? "transform" : "auto",
            }}
          >
            <span className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-[var(--warm-ivory,#F7F5EF)] whitespace-nowrap px-2">
              {hoverText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MagneticText;
