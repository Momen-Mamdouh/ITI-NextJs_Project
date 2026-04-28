import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Auth",
    template: "%s | Auth",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/30 py-8">
      {children}
    </div>
  );
}
