import type { Metadata } from "next";
import { Providers } from "@/store/provider";
import { CartProvider } from "@/components/cart/CartProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <CartProvider>
            <WishlistProvider>
              <SiteHeader />
              {children}
            </WishlistProvider>
          </CartProvider>
        </Providers>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
