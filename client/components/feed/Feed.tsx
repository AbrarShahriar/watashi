"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  TrendingUp,
  Clock,
  Filter,
  Mail,
  MessageSquare,
  ThumbsUp,
  Flame,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { mockFeedData as feedData } from "../../app/data/mockData";
import {
  FeedItem,
  Email,
  NewsletterPost,
  HNResult,
  SubredditResult,
  XPost,
} from "@/app/types/feed";

export default function Feed() {
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set()
  );
  const [sortBy, setSortBy] = useState<"performance" | "recent">("performance");

  const normalizedFeed = useMemo(() => {
    const items: FeedItem[] = [];
    const now = Date.now();

    feedData.emails.forEach((email: Email) => {
      const emailDate = new Date(email.receivedAt).getTime();
      const isRecent = now - emailDate < 24 * 60 * 60 * 1000; // Within 24 hours

      email.posts.forEach((post: NewsletterPost) => {
        items.push({
          title: post.title,
          link: post.link,
          desc: post.desc,
          source: "Newsletter",
          // Boost performance score for recent newsletters
          performanceScore: isRecent ? 95 : 85,
          createdAt: email.receivedAt,
          metadata: {
            emailSubject: email.subject,
            emailFrom: email.from,
          },
        });
      });
    });

    // Process Hacker News results
    feedData.external.hnResults.forEach((hn: HNResult) => {
      // Calculate performance score based on points and comments
      const performanceScore = Math.min(
        100,
        hn.performance.points / 10 + hn.performance.numOfComments / 5
      );

      items.push({
        title: hn.title,
        link: hn.url,
        desc: hn.description || "Discussion on Hacker News",
        source: "Hacker News",
        performanceScore,
        createdAt: hn.createdAt,
        author: hn.author,
        metadata: {
          points: hn.performance.points,
          numOfComments: hn.performance.numOfComments,
        },
      });
    });

    // Process Reddit results
    feedData.external.subredditResults.forEach((reddit: SubredditResult) => {
      // Calculate performance score based on score/ups
      const performanceScore = Math.min(100, reddit.performance.score * 2);

      items.push({
        title: reddit.title,
        link: !reddit.url.startsWith("https://reddit.com")
          ? `https://reddit.com` + reddit.url
          : reddit.url,
        desc: reddit.description || "Discussion on Reddit",
        source: `r/${reddit.source}`,
        performanceScore,
        createdAt: new Date(reddit.createdAt * 1000).toISOString(),
        author: reddit.author,
        metadata: {
          ups: reddit.performance.ups,
          score: reddit.performance.score,
        },
      });
    });

    // Process X posts (if any)
    feedData.external.xPostsResults.forEach((xPost: XPost) => {
      const performanceScore = 70; // Default for X posts

      items.push({
        title: xPost.title,
        link: xPost.url,
        desc: xPost.description,
        source: "X",
        performanceScore,
        createdAt: xPost.createdAt,
        author: xPost.author,
      });
    });

    return items;
  }, []);

  // Get unique sources from the data
  const sources = useMemo(() => {
    const sourceSet = new Set(
      normalizedFeed.map((item: FeedItem) => item.source)
    );
    return Array.from(sourceSet).sort();
  }, [normalizedFeed]);

  // Filter and sort feed items
  const filteredAndSortedFeed = useMemo(() => {
    let filtered = normalizedFeed;

    // Apply source filter
    if (selectedSources.size > 0) {
      filtered = filtered.filter((item: FeedItem) =>
        selectedSources.has(item.source)
      );
    }

    // Sort by performance or date
    const sorted = [...filtered].sort((a: FeedItem, b: FeedItem) => {
      if (sortBy === "performance") {
        return b.performanceScore - a.performanceScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [normalizedFeed, selectedSources, sortBy]);

  const groupedFeed = useMemo(() => {
    const now = Date.now();
    const groups = {
      breaking: [] as FeedItem[],
      today: [] as FeedItem[],
      thisWeek: [] as FeedItem[],
      older: [] as FeedItem[],
    };

    filteredAndSortedFeed.forEach((item: FeedItem) => {
      const itemDate = new Date(item.createdAt).getTime();
      const hoursSincePost = (now - itemDate) / (1000 * 60 * 60);
      const daysSincePost = hoursSincePost / 24;

      // Breaking: Recent newsletters (within 24h) with high performance
      if (
        item.source === "Newsletter" &&
        hoursSincePost < 24 &&
        item.performanceScore >= 90
      ) {
        groups.breaking.push(item);
      }
      // Today: Within last 24 hours
      else if (hoursSincePost < 24) {
        groups.today.push(item);
      }
      // This week: Within last 7 days
      else if (daysSincePost < 7) {
        groups.thisWeek.push(item);
      }
      // Older: Everything else
      else {
        groups.older.push(item);
      }
    });

    return groups;
  }, [filteredAndSortedFeed]);

  const toggleSource = (source: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(source)) {
      newSelected.delete(source);
    } else {
      newSelected.add(source);
    }
    setSelectedSources(newSelected);
  };

  const getSourceColor = (source: string) => {
    if (source === "Newsletter")
      return "bg-chart-1/20 text-chart-1 border-chart-1/50";
    if (source === "Hacker News")
      return "bg-chart-4/20 text-chart-4 border-chart-4/50";
    if (source.startsWith("r/"))
      return "bg-chart-3/20 text-chart-3 border-chart-3/50";
    if (source === "X") return "bg-chart-2/20 text-chart-2 border-chart-2/50";
    return "bg-muted text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 80)
      return { label: "Hot", color: "bg-chart-5 text-white" };
    if (performance >= 60)
      return { label: "Trending", color: "bg-chart-4 text-white" };
    if (performance >= 40)
      return { label: "Popular", color: "bg-chart-2 text-white" };
    return null;
  };

  const renderFeedItem = (item: FeedItem, index: number) => {
    const perfBadge = getPerformanceBadge(item.performanceScore);

    return (
      <Card
        key={index}
        className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur transition-all hover:border-border hover:bg-card hover:shadow-lg"
      >
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6"
        >
          {/* Performance indicator bar */}
          <div
            className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-chart-1/50 via-chart-2/50 to-chart-4/50 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              opacity: item.performanceScore / 100,
            }}
          />

          <div className="flex flex-col gap-3">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className={getSourceColor(item.source)}>
                {item.source}
              </Badge>

              {perfBadge && (
                <Badge className={perfBadge.color}>{perfBadge.label}</Badge>
              )}

              <span className="text-muted-foreground">
                {formatDate(item.createdAt)}
              </span>

              {item.author && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground">{item.author}</span>
                </>
              )}

              {item.metadata?.points !== undefined && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    {item.metadata.points}
                  </span>
                </>
              )}

              {item.metadata?.numOfComments !== undefined && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {item.metadata.numOfComments}
                  </span>
                </>
              )}

              {item.metadata?.score !== undefined && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    {item.metadata.score}
                  </span>
                </>
              )}

              {item.metadata?.emailFrom && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {item.metadata.emailFrom.split("@")[0]}
                  </span>
                </>
              )}
            </div>

            {item.metadata?.emailSubject && (
              <div className="text-xs text-muted-foreground/80 italic">
                From: {item.metadata.emailSubject}
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-balance group-hover:text-chart-1 transition-colors">
              {item.title}
            </h2>

            {/* Description */}
            {item.desc && (
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty line-clamp-3">
                {item.desc}
              </p>
            )}

            {/* Link indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 group-hover:text-chart-1 transition-colors">
              <span className="truncate">{new URL(item.link).hostname}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </div>
          </div>
        </a>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                Content Feed
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Curated content from across the web
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Toggle */}
              <div className="hidden sm:flex gap-1 rounded-lg bg-muted/50 p-1">
                <Button
                  variant={sortBy === "performance" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("performance")}
                  className="text-xs"
                >
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                  Top
                </Button>
                <Button
                  variant={sortBy === "recent" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                  className="text-xs"
                >
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  Recent
                </Button>
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {selectedSources.size > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 rounded-full px-1.5 py-0 text-xs"
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

          {/* Mobile Sort */}
          <div className="sm:hidden mt-4 flex gap-1 rounded-lg bg-muted/50 p-1">
            <Button
              variant={sortBy === "performance" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("performance")}
              className="flex-1 text-xs"
            >
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Top
            </Button>
            <Button
              variant={sortBy === "recent" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("recent")}
              className="flex-1 text-xs"
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              Recent
            </Button>
          </div>
        </div>
      </header>

      {/* Feed with segments */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {groupedFeed.breaking.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2 text-chart-5">
                <Flame className="h-5 w-5" />
                <h2 className="text-2xl font-bold tracking-tight">Breaking</h2>
              </div>
              <Badge
                variant="secondary"
                className="animate-pulse bg-chart-5/20 text-chart-5"
              >
                Fresh newsletters
              </Badge>
            </div>
            <div className="space-y-4">
              {groupedFeed.breaking.map((item, index) =>
                renderFeedItem(item, index)
              )}
            </div>
          </section>
        )}

        {groupedFeed.today.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2 text-chart-1">
                <Zap className="h-5 w-5" />
                <h2 className="text-2xl font-bold tracking-tight">Today</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                Last 24 hours
              </span>
            </div>
            <div className="space-y-4">
              {groupedFeed.today.map((item, index) =>
                renderFeedItem(item, index)
              )}
            </div>
          </section>
        )}

        {groupedFeed.thisWeek.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2 text-chart-3">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-2xl font-bold tracking-tight">This Week</h2>
              </div>
              <span className="text-sm text-muted-foreground">Last 7 days</span>
            </div>
            <div className="space-y-4">
              {groupedFeed.thisWeek.map((item, index) =>
                renderFeedItem(item, index)
              )}
            </div>
          </section>
        )}

        {groupedFeed.older.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <h2 className="text-2xl font-bold tracking-tight">Earlier</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                More than a week ago
              </span>
            </div>
            <div className="space-y-4">
              {groupedFeed.older.map((item, index) =>
                renderFeedItem(item, index)
              )}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filteredAndSortedFeed.length === 0 && (
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

        {/* Stats footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredAndSortedFeed.length} of {normalizedFeed.length}{" "}
          items
          {groupedFeed.breaking.length > 0 && (
            <span className="ml-2 text-chart-5 font-medium">
              • {groupedFeed.breaking.length} breaking
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
