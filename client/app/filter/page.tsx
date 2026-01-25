import EmptyFeed from "@/components/feed/EmptyFeed";
import { FeedCard } from "@/components/feed/FeedCard";
import FeedHeader from "@/components/feed/FeedHeader";
import ClientOnly from "@/components/shared/ClientOnly";
import { getFeedData, getLastUpdateTime } from "@/data/feed-dto";
import { FeedFilterSortCriteria } from "@/lib/types";
import { generateSourcesFromData, sortBy } from "@/lib/utils";
import { Suspense } from "react";

export default async function Filter({
  searchParams,
}: {
  searchParams: Promise<{ category: FeedFilterSortCriteria; sources: string }>;
}) {
  const { sources, category } = await searchParams;
  const feedData = await getFeedData();
  const lastUpdated = await getLastUpdateTime();
  const uniqSources = generateSourcesFromData(feedData);

  const sortByCriteria = category;
  let selectedSources: string[] = [];

  if (sources) {
    if (sources.includes(",")) {
      selectedSources = sources.split(",");
    } else {
      selectedSources = [sources];
    }
  } else {
    selectedSources = uniqSources;
  }

  const sortedFeed = sortBy(feedData, sortByCriteria, selectedSources);

  return (
    <div className="min-h-screen bg-background">
      <Suspense>
        <FeedHeader
          sources={uniqSources}
          data={sortedFeed}
          lastUpdated={lastUpdated}
          searchParams={{
            category,
            sources,
          }}
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
