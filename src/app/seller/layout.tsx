import { SellerSidebar } from "@/features/seller/components/SellerSidebar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Seller",
    template: "%s | Seller",
  },
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SellerSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 bg-muted/10">{children}</main>
      </div>
    </div>
  );
}
