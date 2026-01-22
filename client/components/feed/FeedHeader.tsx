"use client";

import { FeedFilterSortCriteria, FeedItem } from "@/lib/types";
import { TrendingUp, Clock, Filter, MoveRight } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  data: FeedItem[];
  sources: string[];
  searchParams?: {
    category?: FeedFilterSortCriteria;
    sources?: string;
  };
}
export default function FeedHeader({
  data,
  sources,
  searchParams: params,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState((params && params.toString()) || "");

  const [filterMutated, setFilterMutated] = useState(false);

  const [sortCriteria, setSortCriteria] = useState<FeedFilterSortCriteria>(
    (params && (params.category as FeedFilterSortCriteria)) || "top",
  );

  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set((params && params.sources?.split(",")) || []),
  );
  const toggleSource = (source: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(source)) {
      newSelected.delete(source);
    } else {
      newSelected.add(source);
    }
    setFilterMutated(true);
    setSelectedSources(newSelected);
    updateQueryString("sources", setToStr(newSelected));
  };
  const setToStr = (set: Set<string>) => {
    let res = "";
    set.forEach((item) => (res += item + ","));
    res.slice(0, res.length - 2);
    return res;
  };

  const handleCategory = (category: FeedFilterSortCriteria) => {
    setSortCriteria(category);
    setFilterMutated(true);
    updateQueryString("category", category);
  };

  const updateQueryString = (name: string, value: string) => {
    const newParams = new URLSearchParams(query);
    newParams.set(name, value);
    setQuery(newParams.toString());
  };

  const handleApply = () => {
    setFilterMutated(false);
    router.push("/filter" + "?" + query);
  };

  return (
    <header className="border-b border-border/40 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href={"/"} className="text-2xl font-bold tracking-tight">
              Feed
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} items from {selectedSources.size - 1} sources
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
              <Button
                variant={sortCriteria === "top" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleCategory("top")}
                className="text-xs h-8"
              >
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Top
              </Button>
              <Button
                variant={sortCriteria === "new" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleCategory("new")}
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
                  className="h-8 bg-transparent cursor-pointer"
                >
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  Filter
                  {selectedSources.size > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
                    >
                      {selectedSources.size - 1}
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

            {filterMutated && (
              <Button
                onClick={handleApply}
                variant="secondary"
                size="sm"
                className="text-xs h-8"
              >
                {filterMutated ? "Apply" : "Applied"}
                <MoveRight className="mr-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
