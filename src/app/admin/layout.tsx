import { Sidebar } from "@/features/admin/components/Sidebar";
import { Header } from "@/features/admin/components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-muted/10">{children}</main>
      </div>
    </div>
  );
}
