import { fetchCategories } from "@/features/category/category-actions";
import { CategoryManager } from "@/features/admin/components/CategoryManager";

export default async function AdminCategoriesPage() {
  const res = await fetchCategories();
  if (!res.success || !res.data) {
    return (
      <div className="text-destructive">
        Could not load categories. Is MongoDB running?
      </div>
    );
  }

  const rows = JSON.parse(JSON.stringify(res.data)) as {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
  }[];

  return <CategoryManager initial={rows} />;
}
