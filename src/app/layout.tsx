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
  metadataBase: new URL("https://medikiosk-aftercode.vercel.app"),
  openGraph: {
    title: "MediKiosk - Patient Intake & Clinical OPD Triage",
    description: "Accessible, resilient digital medical intake for hospital OPDs with dual-language support, voice and touch input, and offline continuity.",
    url: "https://medikiosk-aftercode.vercel.app",
    siteName: "MediKiosk",
    images: [
      {
        url: "/images/peeps/all-peeps.png",
        width: 1200,
        height: 630,
        alt: "MediKiosk Outpatient Intake Terminal Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediKiosk - Outpatient Digital Intake",
    description: "Resilient digital intake for hospital OPDs with dual-language support and offline continuity.",
    images: ["/images/peeps/all-peeps.png"],
  },
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-xl bg-[var(--btn-main)] text-[var(--btn-main-text)] font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Skip to main content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
