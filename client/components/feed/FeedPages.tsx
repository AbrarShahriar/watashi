"use client";

import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function FeedPages({ currentPage, totalPages }: Props) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  console.log(totalPages);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "/";
  };

  const createPageButtons = () => {
    const buttons = [];
    let start = currentPage - 2,
      end = currentPage + 2;

    if (start <= 0) start = 1;
    if (end >= totalPages) end = totalPages;

    for (let i = start; i <= end; i++) {
      const pageNum = i;
      buttons.push(
        <Button
          variant={pageNum == currentPage ? "secondary" : "ghost"}
          size="sm"
          className="w-8 h-8 p-0 cursor-pointer"
          onClick={() => router.push(createPageUrl(pageNum))}
        >
          {pageNum}
        </Button>,
      );
    }

    return buttons;
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
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-2">
        {totalPages > 5 && currentPage > 3 && (
          <Ellipsis size={12} className="opacity-50 mr-2.5" />
        )}
        {createPageButtons().map((pageButton, i) => (
          <React.Fragment key={i}>{pageButton}</React.Fragment>
        ))}
        {totalPages > 5 && !(currentPage + 2 >= totalPages) && (
          <Ellipsis size={12} className="opacity-50 ml-2.5" />
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => router.push(createPageUrl(currentPage + 1))}
        className="bg-transparent"
      >
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
