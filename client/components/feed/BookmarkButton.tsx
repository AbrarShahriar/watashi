import React, { useSyncExternalStore } from "react";
import { Button } from "../ui/button";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { Bookmark } from "@/lib/bookmark";
import { FeedItem } from "@/lib/types";

interface Props {
  item: FeedItem;
}

export default function BookmarkButton({ item }: Props) {
  const itemBookmarked = useSyncExternalStore(
    (callback) => Bookmark.subscribe(callback),
    () => Bookmark.isBookmarked(item),
    () => false,
  );
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 cursor-pointer ${
        itemBookmarked
          ? "text-amber-400 hover:text-amber-500"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        Bookmark.toggleBookmark(item);
      }}
    >
      <BookmarkIcon
        className={`h-4 w-4 ${itemBookmarked ? "fill-current" : ""}`}
      />
      <span className="sr-only">
        {itemBookmarked ? "Remove bookmark" : "Add bookmark"}
      </span>
    </Button>
  );
}
