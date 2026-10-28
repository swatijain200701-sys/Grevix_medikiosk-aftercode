import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ThemeInitScript } from "@/lib/theme/ThemeInitScript";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "MediKiosk - Patient Intake & Clinical OPD Triage",
  description: "Accessible, resilient digital medical intake for hospital OPDs with dual-language support, voice and touch input, and offline continuity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${notoDevanagari.variable} h-full antialiased font-sans`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full flex flex-col transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
