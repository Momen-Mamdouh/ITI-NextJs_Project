"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/actions";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const handleSignOut = async () => {
    await logoutUser();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
