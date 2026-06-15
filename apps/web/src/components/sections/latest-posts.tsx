import { useTranslations } from "next-intl";
import type { BlogPost } from "@portfolio/shared-types/site";
import { Link } from "@/i18n/navigation";

type LatestPostsProps = {
  posts: BlogPost[];
};

export function LatestPosts({ posts }: LatestPostsProps) {
  const t = useTranslations("Home.posts");

  return (
    <section className="flex flex-1 flex-col gap-4 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      {posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <h3 className="font-medium">{post.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/blog" className="text-sm font-medium underline">
        {t("seeAll")}
      </Link>
    </section>
  );
}
