// src/app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Commerce Platform",
  description: "Multi-role marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
