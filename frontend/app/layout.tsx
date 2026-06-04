import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MomentumScan — Real-time Small-Cap Scanner",
  description:
    "Spot Ross Cameron-style momentum plays as they happen. Real-time gap%, RVOL, and float filters updated every minute.",
  openGraph: {
    title: "MomentumScan",
    description: "Real-time momentum day trading scanner",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
