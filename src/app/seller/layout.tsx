import { SellerSidebar } from "@/features/seller/components/SellerSidebar";
import { SellerHeader } from "@/features/seller/components/SellerHeader";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SellerSidebar />
      <div className="flex-1 flex flex-col">
        <SellerHeader />
        <main className="flex-1 p-6 bg-muted/10">{children}</main>
      </div>
    </div>
  );
}
