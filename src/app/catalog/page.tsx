import { searchBooks } from "@/lib/db/books";
import { getCategories } from "@/lib/db/categories";
import { CatalogClientView } from "@/components/catalog/catalog-client-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Catalogue | Literary Harbor",
  description: "Explore literature by subject, tradition, era, and reader interest. Discover classics, sacred texts, philosophy, history, poetry, and more.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const page = parseInt(resolvedSearchParams.page || "1");
  const selectedCat = resolvedSearchParams.category || "";

  // Fetch all books (up to 1000) and categories
  const { data: initialBooks, count } = await searchBooks(query, page, 1000);
  const categories = await getCategories();

  return (
    <CatalogClientView
      initialBooks={initialBooks || []}
      totalCount={count || 0}
      categories={categories || []}
      initialQuery={query}
      selectedCat={selectedCat}
    />
  );
}
