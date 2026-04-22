import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthCard
        title="Welcome back"
        description="Sign in to your account to continue"
        footer={
          <>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
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
        <LoginForm />
      </AuthCard>
    </div>
  );
}
