import { sortBy } from "@/lib/utils";
import Feed from "../components/feed/Feed";
import { getFeedData, getTotalPages } from "@/data/feed-dto";

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { page } = await searchParams;

  const formattedPage = page ? parseInt(page) : 1;

  const feedData = await getFeedData({ page: formattedPage });

  const totalPages = await getTotalPages();

  return (
    <Feed
      currentPage={formattedPage}
      totalPages={totalPages}
      feedItems={feedData}
    />
  );
}
