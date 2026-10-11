"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTheme, ThemeOption } from "@/lib/theme/ThemeProvider";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4 text-cyan-400" /> },
    { value: "system", label: "System", icon: <Monitor className="w-4 h-4 text-slate-400" /> },
  ];

  const currentIcon =
    resolvedTheme === "dark" ? (
      <Moon className="w-4 h-4 text-cyan-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-500" />
    );

  const currentLabel =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change display theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-body)] hover:bg-[var(--bg-panel)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] text-xs md:text-sm font-medium shadow-sm"
      >
        {currentIcon}
        {!compact && <span>{currentLabel}</span>}
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select theme"
          className="absolute right-0 mt-2 w-36 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-1 z-50 text-xs md:text-sm"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={theme === opt.value}
              onClick={() => {
                setTheme(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                theme === opt.value
                  ? "bg-[var(--btn-main)] text-[var(--btn-main-text)] font-semibold"
                  : "text-[var(--text-body)] hover:bg-[var(--bg-panel)]"
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
