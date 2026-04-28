import { getProfile } from "@/features/user/actions";
import { ProfileForm } from "@/features/user/components/ProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const result = await getProfile();

  if (!result.success || !result.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>
      <div className="max-w-lg">
        <ProfileForm
          defaultValues={{
            name: result.user.name,
            phone: result.user.phone,
            email: result.user.email,
            preferredLanguage: result.user.preferredLanguage,
            role: result.user.role,
          }}
        />
      </div>
    </div>
  );
}
