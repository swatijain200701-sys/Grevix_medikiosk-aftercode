import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediKiosk — Patient Intake & Clinical OPD Triage",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#08121B] text-[#B6C7CF] selection:bg-[#50D6C5]/20 selection:text-[#50D6C5]">
        {children}
      </body>
    </html>
  );
}
