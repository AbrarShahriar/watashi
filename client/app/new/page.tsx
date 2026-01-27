import Feed from "@/components/feed/Feed";
import { getFeedData, getTotalPages } from "@/data/feed-dto";
import { sortBy } from "@/lib/utils";

export default async function Filter({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { page } = await searchParams;

  const formattedPage = page ? parseInt(page) : 1;

  const feedData = await getFeedData({ page: formattedPage });
  const totalPages = await getTotalPages();
  const sortedFeed = sortBy(feedData, "new") || [];

  return (
    <Feed
      currentPage={formattedPage}
      totalPages={totalPages}
      feedItems={sortedFeed}
    />
  );
}
