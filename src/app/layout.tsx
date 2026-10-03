import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cavalieri Barbearia",
  description: "Agende, veja produtos e acompanhe sua fidelidade",
  manifest: "/manifest.webmanifest",
  icons: { apple: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-black font-sans pb-20">{children}<BottomNav /></body>
    </html>
  );
}
