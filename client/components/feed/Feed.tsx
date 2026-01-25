import { FeedCard } from "./FeedCard";
import { getFeedData, getLastUpdateTime } from "@/data/feed-dto";
import FeedHeader from "./FeedHeader";
import { generateSourcesFromData, sortBy } from "@/lib/utils";
import { Suspense } from "react";
import EmptyFeed from "./EmptyFeed";

export default async function FeedPage() {
  const feedData = await getFeedData();
  const lastUpdated = await getLastUpdateTime();
  const sortedFeed = sortBy(feedData, "top") || [];
  const sources = generateSourcesFromData(feedData);

  return (
    <div className="min-h-screen bg-background">
      <Suspense>
        <FeedHeader
          sources={sources}
          data={sortedFeed}
          lastUpdated={lastUpdated}
        />
      </Suspense>

      {/* Feed */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {sortedFeed && sortedFeed.length > 0 ? (
          <div className="space-y-3">
            {sortedFeed.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <EmptyFeed />
          </div>
        )}
      </main>
    </div>
  );
}
