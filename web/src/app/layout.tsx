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
  title: {
    default: "MacroTracker",
    template: "%s | MacroTracker",
  },
  description:
    "Mobile-first macro tracking companion with goal insights, calorie balance, and actionable coaching prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-950">
          {children}
        </div>
      </body>
    </html>
  );
}
