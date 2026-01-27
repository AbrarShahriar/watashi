import FeedList from "./FeedList";
import { FeedItem } from "@/lib/types";
import FeedPages from "./FeedPages";

interface Props {
  feedItems: FeedItem[];
  currentPage: number;
  totalPages: number;
}

export default async function Feed({
  feedItems,
  currentPage,
  totalPages,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      {/* Feed */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <FeedList feedItems={feedItems} />

        <FeedPages currentPage={currentPage} totalPages={totalPages} />
      </main>
    </div>
  );
}
