"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Flame } from "lucide-react";
import { FeedItem } from "@/lib/types";
import { formatRelativeTime, formatURL } from "@/lib/utils";
import Image from "next/image";
import { getSourceStyles } from "@/lib/sourceStyle";

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const styles = getSourceStyles(item.source);
  const isHot = item.score >= 80;

  return (
    <Card className="group border-border/40 bg-card/30 hover:bg-card/60 hover:border-border/60 transition-all duration-200">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-5"
      >
        <div className="flex flex-col gap-2.5">
          {/* Top row: Source badge + metadata */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${styles.badge}`}
              >
                {item.source}
              </Badge>
              {isHot && <Flame className="h-3.5 w-3.5 text-orange-400" />}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>

          {item.media && (
            <Image
              className="rounded-md h-fit"
              width={1000}
              height={1000}
              alt={`Post by ${item.author}`}
              src={item.media}
            />
          )}
          {/* Title */}
          <h3
            className={`text-base font-semibold leading-snug text-foreground group-hover:${styles.accent} transition-colors line-clamp-2`}
          >
            {item.title}
          </h3>
          {/* Description - only show if exists and not too long */}
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
          {/* Bottom row: Stats + Link */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {item.author && (
                <span className="truncate max-w-30">by {item.author}</span>
              )}
            </div>
            <div
              className={`flex items-center gap-1 text-xs text-muted-foreground/60 group-hover:${styles.accent} transition-colors`}
            >
              <span className="truncate max-w-25 hidden sm:inline">
                {formatURL(item.url)}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </div>
          </div>
        </div>
      </a>
    </Card>
  );
}
