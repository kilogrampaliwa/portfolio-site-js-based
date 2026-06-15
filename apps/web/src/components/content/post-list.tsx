import type { BlogPost } from "@portfolio/shared-types/site";
import { Link } from "@/i18n/navigation";

type PostListProps = {
  posts: BlogPost[];
  emptyLabel: string;
};

export function PostList({ posts, emptyLabel }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {posts.map((post) => (
        <li key={post.id}>
          <h3 className="text-xl font-medium">
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>
          {post.publishedAt ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{post.publishedAt.slice(0, 10)}</p>
          ) : null}
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
          {post.tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
