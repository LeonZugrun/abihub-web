import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AbiHub 2026",
  description: "Abitur-Dashboard, MSS Notenrechner & Abizeitung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
