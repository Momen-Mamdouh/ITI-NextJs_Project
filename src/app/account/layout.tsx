import { AccountSidebar } from "@/features/user/components/AccountSidebar";
import { Logo } from "@/shared/components/Logo";
import Link from "next/link";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/">
            <Logo className="h-6" />
          </Link>
          <span className="text-sm text-muted-foreground">My Account</span>
        </div>
      </header>

      <div className="container mx-auto flex gap-8 px-4 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-22">
            <AccountSidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
