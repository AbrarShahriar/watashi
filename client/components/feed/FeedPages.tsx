"use client";

import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function FeedPages({ currentPage, totalPages }: Props) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "/";
  };

  return (
    <div className="flex items-center justify-between border-t border-border/40 pt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => router.push(createPageUrl(currentPage - 1))}
        className="bg-transparent"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>
      <div className="flex items-center gap-2">
        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <Button
              key={pageNum}
              variant={pageNum == currentPage ? "secondary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => router.push(createPageUrl(pageNum))}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => router.push(createPageUrl(currentPage + 1))}
        className="bg-transparent"
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
