import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
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
            <footer className="mt-6 flex flex-col gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="link-interactive font-medium"
                >
                  Sign up
                </Link>
              </p>
            </footer>
          </>
        }
      >
        <LoginForm redirectTo={redirectTo} />
      </AuthCard>
    </div>
  );
}
