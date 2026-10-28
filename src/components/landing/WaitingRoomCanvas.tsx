"use client";

/**
 * WaitingRoomCanvas — Adapted from Skiper 39 Canvas_Landing_004 & CodePen xxwbBQV
 * Original Concept & CodePen: Szenia Zadvornykh (https://codepen.io/zadvorsky/pen/xxwbBQV)
 * Illustration Library: Open Peeps by Pablo Stanley (https://www.openpeeps.com/ - CC0 Public Domain)
 * React / Tailwind Adaptation: Skiper UI (@gurvinder-singh02, https://gxuri.me)
 * Hardened & Re-architected for MediKiosk:
 * - StrictMode & late-load leak protection with gsap.context() and cancelled lifecycle flags
 * - IntersectionObserver + visibilitychange ticker pause (zero background CPU usage)
 * - Accessible fallback on error or image failure
 * - Full prefers-reduced-motion static rendering
 * - Debounced ResizeObserver with mobile URL-bar tolerance
 * - Strict type-safety, capped DPR (max 2), and non-blocking pointer events
 */

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  randomRange,
  removeRandomFromArray,
  removeItemFromArray,
  getRandomFromArray,
  calculateSpriteRects,
} from "./canvas-utils";

interface WaitingRoomCanvasProps {
  src?: string;
  rows?: number;
  cols?: number;
  desktopCount?: number;
  mobileCount?: number;
  className?: string;
}

interface Peep {
  image: HTMLImageElement;
  rect: [number, number, number, number];
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
  setRect: (rect: [number, number, number, number]) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
}

export function WaitingRoomCanvas({
  src = "/images/peeps/all-peeps.png",
  rows = 15,
  cols = 7,
  desktopCount = 14,
  mobileCount = 6,
  className = "",
}: WaitingRoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = reducedMotionQuery.matches;

    const motionListener = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      handleResize(true);
    };
    reducedMotionQuery.addEventListener("change", motionListener);

    // Bounded DPR (Max 2 for performance & memory safety)
    const getClampedDpr = () => Math.min(window.devicePixelRatio || 1, 2);

    // Scoped GSAP context
    const gsapCtx = gsap.context(() => {});

    // Stage Dimensions
    const stage = { width: 0, height: 0 };
    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    let isTickerRunning = false;
    let isVisibleOnScreen = true;
    let isTabVisible = document.visibilityState === "visible";

    // Peep Factory
    const createPeep = (image: HTMLImageElement, rect: [number, number, number, number]): Peep => {
      const peep: Peep = {
        image,
        rect,
        width: rect[2],
        height: rect[3],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (newRect: [number, number, number, number]) => {
          peep.rect = newRect;
          peep.width = newRect[2];
          peep.height = newRect[3];
        },
        render: (renderCtx: CanvasRenderingContext2D) => {
          renderCtx.save();
          renderCtx.translate(peep.x, peep.y);
          renderCtx.scale(peep.scaleX, 1);
          renderCtx.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height
          );
          renderCtx.restore();
        },
      };
      return peep;
    };

    // Tween factories
    const resetPeep = (peep: Peep) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = 40 - 120 * gsap.parseEase("power2.in")(Math.random());
      const startY = stage.height - peep.height + offsetY;
      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width + 10;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width;
        endX = -10;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return { startX, startY, endX };
    };

    const normalWalk = (peep: Peep, bounds: { startX: number; startY: number; endX: number }) => {
      const { startY, endX } = bounds;
      const xDuration = randomRange(9, 14);
      const yDuration = 0.28;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.8, 1.3));
      tl.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0);
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: Math.floor(xDuration / yDuration),
          yoyo: true,
          y: startY - 8,
          ease: "sine.inOut",
        },
        0
      );

      return tl;
    };

    const addPeepToCrowd = (): Peep | null => {
      if (availablePeeps.length === 0) return null;
      const peep = removeRandomFromArray(availablePeeps);
      if (!peep) return null;

      const bounds = resetPeep(peep);

      if (prefersReducedMotion) {
        // Under reduced motion: place statically along stage
        peep.x = randomRange(20, Math.max(stage.width - peep.width - 20, 40));
        peep.y = stage.height - peep.height;
        crowd.push(peep);
        crowd.sort((a, b) => a.anchorY - b.anchorY);
        return peep;
      }

      gsapCtx.add(() => {
        const walkTl = normalWalk(peep, bounds);
        walkTl.eventCallback("onComplete", () => {
          if (isCancelled) return;
          removeItemFromArray(crowd, peep);
          availablePeeps.push(peep);
          addPeepToCrowd();
        });
        peep.walk = walkTl;
      });

      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const render = () => {
      if (!canvas || isCancelled) return;
      const dpr = getClampedDpr();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Render all active peeps
      for (let i = 0; i < crowd.length; i++) {
        crowd[i].render(ctx);
      }

      ctx.restore();
    };

    const startTicker = () => {
      if (!isTickerRunning && !prefersReducedMotion && isVisibleOnScreen && isTabVisible) {
        gsap.ticker.add(render);
        isTickerRunning = true;
      }
    };

    const stopTicker = () => {
      if (isTickerRunning) {
        gsap.ticker.remove(render);
        isTickerRunning = false;
      }
    };

    const populateCrowd = () => {
      // Clear existing walks
      for (const p of crowd) {
        if (p.walk) p.walk.kill();
      }
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      const targetCount = stage.width < 768 ? mobileCount : desktopCount;
      const maxSprites = Math.min(targetCount, availablePeeps.length);

      for (let i = 0; i < maxSprites; i++) {
        const p = addPeepToCrowd();
        if (p && p.walk && !prefersReducedMotion) {
          p.walk.progress(Math.random());
        }
      }

      if (prefersReducedMotion) {
        render(); // Single clean static frame
      }
    };

    let lastWidth = 0;
    const handleResize = (force = false) => {
      if (!canvas || !container || isCancelled) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      // Ignore trivial mobile URL-bar vertical resizes
      if (!force && Math.abs(w - lastWidth) < 16) {
        return;
      }
      lastWidth = w;

      const dpr = getClampedDpr();
      stage.width = w;
      stage.height = h;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      populateCrowd();
    };

    // Load sprite sheet image safely
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (isCancelled) return;
      setIsLoaded(true);

      const rects = calculateSpriteRects(img.naturalWidth, img.naturalHeight, rows, cols);
      for (const rect of rects) {
        allPeeps.push(createPeep(img, rect));
      }

      handleResize(true);
      startTicker();
    };

    img.onerror = () => {
      if (isCancelled) return;
      setHasError(true);
    };

    img.src = src;

    // ResizeObserver on the container
    let resizeTimer: NodeJS.Timeout | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        handleResize(false);
      }, 100);
    });
    resizeObserver.observe(container);

    // IntersectionObserver to pause rendering offscreen
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleOnScreen = entry.isIntersecting;
        if (isVisibleOnScreen) {
          startTicker();
        } else {
          stopTicker();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // VisibilityChange listener
    const handleVisibility = () => {
      isTabVisible = document.visibilityState === "visible";
      if (isTabVisible && isVisibleOnScreen) {
        startTicker();
      } else {
        stopTicker();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isCancelled = true;
      img.onload = null;
      img.onerror = null;
      stopTicker();
      reducedMotionQuery.removeEventListener("change", motionListener);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);

      for (const p of crowd) {
        if (p.walk) p.walk.kill();
      }
      gsapCtx.revert();
    };
  }, [src, rows, cols, desktopCount, mobileCount]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[clamp(220px,30vh,340px)] overflow-hidden select-none pointer-events-none ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      {/* Fallback SVG when image fails to load or offline without asset */}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg
            className="w-full h-full max-h-56 text-[var(--slate-accent)]"
            viewBox="0 0 800 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Waiting room silhouettes & chairs */}
            <path
              d="M100 210H700M120 170H180M150 170V210M260 170H320M290 170V210M400 170H460M430 170V210M540 170H600M570 170V210"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="150" cy="120" r="18" fill="currentColor" opacity="0.5" />
            <path d="M135 145C135 136 142 138 150 138C158 138 165 136 165 145V170H135V145Z" fill="currentColor" opacity="0.4" />
            <circle cx="430" cy="115" r="18" fill="currentColor" opacity="0.5" />
            <path d="M415 140C415 132 422 134 430 134C438 134 445 132 445 140V170H415V140Z" fill="currentColor" opacity="0.4" />
            <circle cx="570" cy="122" r="18" fill="currentColor" opacity="0.5" />
            <path d="M555 147C555 138 562 140 570 140C578 140 585 138 585 147V170H555V147Z" fill="currentColor" opacity="0.4" />
          </svg>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            // Soft gradient mask fading out at the top so text stays 100% legible
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
