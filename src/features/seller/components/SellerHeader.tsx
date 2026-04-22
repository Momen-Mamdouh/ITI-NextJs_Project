import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SellerHeader() {
  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-lg font-semibold">Seller Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
