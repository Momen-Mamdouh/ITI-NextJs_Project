import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

type Props = { searchParams?: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const redirectTo = sp.next;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <AuthCard
        title="Create an account"
        description="Start shopping or selling today"
        footer={
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={
                sp.next
                  ? `/auth/login?next=${encodeURIComponent(sp.next)}`
                  : "/auth/login"
              }
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        }
      >
        <RegisterForm redirectTo={redirectTo} />
      </AuthCard>
    </div>
  );
}
