"use client";

import EmptyFeed from "@/components/feed/EmptyFeed";
import { FeedCard } from "@/components/feed/FeedCard";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/lib/bookmark";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

export default function BookmarksPage() {
  const feedData = useSyncExternalStore(
    (callback) => Bookmark.subscribe(callback),
    () => Bookmark.getBookmarks(),
    () => Bookmark.getSSRDefault(),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold tracking-tight">Saved Items</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your bookmarked content
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant={"outline"}
            size={"sm"}
            asChild
            className="bg-transparent"
          >
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to feed
            </Link>
          </Button>

          {feedData.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => Bookmark.clearBookmarks()}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear all ({feedData.length})
            </Button>
          )}
        </div>
        {feedData && feedData.length > 0 ? (
          <div className="space-y-3">
            {feedData.map((item) => (
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
