import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AbiHub 2026 - Dein Abitur Begleiter",
  description: "Notenrechner, Pinnwand & Jahrgangsverwaltung für das Abitur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="bg-[#0B111E] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
