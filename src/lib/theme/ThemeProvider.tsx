"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeOption = "light" | "dark" | "system";

interface ThemeCtx {
  theme: ThemeOption;
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeOption) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export const THEME_STORAGE_KEY = "medikiosk-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Fresh visit defaults to 'light' regardless of system preference
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeOption) || "light";
    setThemeState(stored);
    const resolved = stored === "system" ? getSystemPreference() : stored === "dark" ? "dark" : "light";
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const next: "light" | "dark" = e.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, mounted]);

  const setTheme = useCallback((t: ThemeOption) => {
    localStorage.setItem(THEME_STORAGE_KEY, t);
    setThemeState(t);
    const resolved = t === "system" ? getSystemPreference() : t === "dark" ? "dark" : "light";
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: mounted ? theme : "light",
        resolvedTheme: mounted ? resolvedTheme : "light",
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function resetKioskTheme() {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, "light");
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add("light");
  document.documentElement.style.colorScheme = "light";
}
