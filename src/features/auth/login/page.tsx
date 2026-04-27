import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { searchParams?: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const redirectTo = sp.next;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <AuthCard
        title="Welcome back"
        description="Sign in to your account to continue"
        footer={
          <>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={sp.next ? `/auth/register?next=${encodeURIComponent(sp.next)}` : "/auth/register"}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
            <Link href="/auth/forgot-password">
              <Button variant="outline" className="w-full">
                Forgot password?
              </Button>
            </Link>
          </>
        }
      >
        <LoginForm redirectTo={redirectTo} />
      </AuthCard>
    </div>
  );
}
