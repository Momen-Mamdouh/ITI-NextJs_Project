import { AccountSidebar } from "@/features/user/components/AccountSidebar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Account",
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto flex gap-8 px-4 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-20">
            <AccountSidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
