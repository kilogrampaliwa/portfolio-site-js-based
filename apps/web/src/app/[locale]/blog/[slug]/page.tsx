import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@portfolio/shared-types/locale";
import { getPostBySlug } from "@/lib/apiSite";
import { Link } from "@/i18n/navigation";
import { Markdown } from "@/components/content/markdown";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const post = await getPostBySlug(locale, slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("BlogPostPage");

  return (
    <article className="flex flex-1 flex-col gap-6 px-6 py-12">
      <Link href="/blog" className="text-sm font-medium underline">
        {t("back")}
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
      {post.publishedAt ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{post.publishedAt.slice(0, 10)}</p>
      ) : null}
      {post.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <Markdown content={post.content} />
    </article>
  );
}
