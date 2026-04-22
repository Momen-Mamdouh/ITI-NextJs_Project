import { fetchUsers } from "@/features/admin/admin-actions";
import { UserTable } from "@/features/admin/components/UserTable";

export default async function UsersPage() {
  const result = await fetchUsers();
  if (!result.success) return <div>Error loading users</div>;
  return <UserTable users={result.data || []} />;
}
