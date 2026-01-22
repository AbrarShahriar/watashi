import { FeedCard } from "./FeedCard";
import { getFeedData } from "@/data/feed-dto";
import FeedHeader from "./FeedHeader";
import { generateSourcesFromData, sortBy } from "@/lib/utils";
import { FeedFilterSortCriteria } from "@/lib/types";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category: FeedFilterSortCriteria; sources: string }>;
}) {
  const feedData = await getFeedData();
  const sortedFeed = sortBy(feedData, "top") || [];
  const sources = generateSourcesFromData(feedData);

  return (
    <div className="min-h-screen bg-background">
      <FeedHeader
        sources={sources}
        data={sortedFeed}
        searchParams={searchParams}
      />

      {/* Feed */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {sortedFeed && sortedFeed.length > 0 && (
          <div className="space-y-3">
            {sortedFeed.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
