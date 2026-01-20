"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { normalizeFeedData } from "@/lib/utils";
import { FeedCard } from "./FeedCard";
import { FeedData } from "@/app/types";

export default function FeedPage() {
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(),
  );
  const [sortBy, setSortBy] = useState<"performance" | "recent">("performance");
  const [feedData, setFeedData] = useState<FeedData>();

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/feed`);
      const data = await res.json();
      console.log(data);

      return data;
    };

    getData().then((data) => setFeedData(data));
  }, []);

  // Normalize all feed data into a unified array
  const normalizedFeed = useMemo(() => {
    return feedData && normalizeFeedData(feedData as FeedData);
  }, [feedData]);

  // Get unique sources
  const sources = useMemo(() => {
    if (normalizedFeed) {
      const sourceSet = new Set(normalizedFeed.map((item) => item.source));
      return Array.from(sourceSet).sort();
    }
    return [];
  }, [normalizedFeed]);

  // Filter and sort feed items
  const sortedFeed = useMemo(() => {
    if (normalizedFeed) {
      let filtered = normalizedFeed;

      // Apply source filter
      if (selectedSources.size > 0) {
        filtered = filtered.filter((item) => selectedSources.has(item.source));
      }

      // Sort by performance score or date
      return [...filtered].sort((a, b) => {
        if (sortBy === "performance") {
          return b.score - a.score;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }
    return [];
  }, [normalizedFeed, selectedSources, sortBy]);

  const toggleSource = (source: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(source)) {
      newSelected.delete(source);
    } else {
      newSelected.add(source);
    }
    setSelectedSources(newSelected);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - not sticky */}
      <header className="border-b border-border/40 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {sortedFeed.length} items from {sources.length} sources
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Toggle */}
              <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
                <Button
                  variant={sortBy === "performance" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("performance")}
                  className="text-xs h-8"
                >
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                  Top
                </Button>
                <Button
                  variant={sortBy === "recent" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className="text-xs h-8"
                >
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  New
                </Button>
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-transparent"
                  >
                    <Filter className="mr-1.5 h-3.5 w-3.5" />
                    Filter
                    {selectedSources.size > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
                      >
                        {selectedSources.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sources</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sources.map((source) => (
                    <DropdownMenuCheckboxItem
                      key={source}
                      checked={selectedSources.has(source)}
                      onCheckedChange={() => toggleSource(source)}
                    >
                      {source}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedSources.size > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <button
                        type="button"
                        onClick={() => setSelectedSources(new Set())}
                        className="w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground text-left"
                      >
                        Clear filters
                      </button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {sortedFeed.length > 0 ? (
          <div className="space-y-3">
            {sortedFeed.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No items match your filters</p>
            <Button
              variant="link"
              onClick={() => setSelectedSources(new Set())}
              className="mt-2"
            >
              Clear filters
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
