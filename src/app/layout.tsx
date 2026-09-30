import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AutoAdvanceDriver } from "@/components/auto-advance-driver";
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
  title: "Paloo",
  description: "A digital queue for the university account section.",
  // Once Paloo sits on the home screen it opens without browser chrome, which
  // is the state iOS requires before it will show a notification at all.
  appleWebApp: { capable: true, title: "Paloo", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <AutoAdvanceDriver />
      </body>
    </html>
  );
}
