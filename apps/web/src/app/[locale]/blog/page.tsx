import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getPosts } from "@/lib/apiSite";
import { PostList } from "@/components/content/post-list";
import { Pagination } from "@/components/content/pagination";

const PAGE_SIZE = 3;

type BlogPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const locale = (await getLocale()) as Locale;

  const [t, paginated] = await Promise.all([
    getTranslations("BlogPage"),
    getPosts(locale, currentPage, PAGE_SIZE),
  ]);

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <PostList posts={paginated.items} emptyLabel={t("empty")} />
      <Pagination
        currentPage={paginated.page}
        totalPages={paginated.totalPages}
        basePath="/blog"
        previousLabel={t("previous")}
        nextLabel={t("next")}
      />
    </section>
  );
}
