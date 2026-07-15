import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
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
  title: "My TMS",
  description: "Transportation management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full text-zinc-100">
        <Suspense fallback={<div className="glass h-screen w-64 shrink-0" />}>
          <Sidebar />
        </Suspense>
        <main className="min-w-0 flex-1 px-8 py-8 lg:px-12">{children}</main>
      </body>
    </html>
  );
}
