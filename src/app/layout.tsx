import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agendar — Cavalieri Barbearia",
  description: "Reserve seu horário na Cavalieri Barbearia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-black font-sans">{children}</body>
    </html>
  );
}
