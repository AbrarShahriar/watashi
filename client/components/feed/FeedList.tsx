import { FeedItem } from "@/lib/types";
import React from "react";
import EmptyFeed from "./EmptyFeed";
import { FeedCard } from "./FeedCard";

interface Props {
  feedItems: FeedItem[];
}

export default function FeedList({ feedItems }: Props) {
  if (!feedItems || feedItems.length <= 0) {
    return (
      <div className="space-y-3">
        <EmptyFeed />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {feedItems.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
