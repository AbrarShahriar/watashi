import { TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { getFeedData, getLastUpdateTime, getSources } from "@/data/feed-dto";
import FeedHeaderLink from "./FeedHeaderLink";

export default async function FeedHeader() {
  const feedData = await getFeedData();
  const sources = await getSources();
  const lastUpdated = await getLastUpdateTime();

  // const [query, setQuery] = useState((params && params.toString()) || "");
  // const [selectedSources, setSelectedSources] = useState<Set<string>>(
  //   new Set((params && params.sources?.split(",").filter((el) => el)) || []),
  // );
  // const [filterMutated, setFilterMutated] = useState(false);
  // const toggleSource = (source: string) => {
  //   const newSelected = new Set(selectedSources);
  //   if (newSelected.has(source)) {
  //     newSelected.delete(source);
  //   } else {
  //     newSelected.add(source);
  //   }
  //   setFilterMutated(true);
  //   setSelectedSources(newSelected);
  //   updateQueryString("sources", setToStr(newSelected));
  // };
  // const setToStr = (set: Set<string>) => {
  //   let res = "";
  //   set.forEach((item) => (res += item + ","));
  //   res.slice(0, res.length - 2);
  //   return res;
  // };
  // const updateQueryString = (name: string, value: string) => {
  //   const newParams = new URLSearchParams(query);
  //   newParams.set(name, value);
  //   setQuery(newParams.toString());
  // };

  // const handleApply = () => {
  //   setFilterMutated(false);
  //   router.push("/filter" + "?" + query);
  // };

  return (
    <header className="border-b border-border/40 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href={"/"} className="text-2xl font-bold tracking-tight mr-4">
              Feed
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {feedData.length} items from {sources.length} sources collected{" "}
              <span className="text-amber-600 lowercase">
                {formatRelativeTime(lastUpdated)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
              <FeedHeaderLink activeIf={"top"} href={"/"}>
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Top
              </FeedHeaderLink>
              <FeedHeaderLink activeIf={"new"} href={"/new"}>
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                New
              </FeedHeaderLink>
            </div>

            {/* Filter Dropdown */}
            {/* <DropdownMenu>
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
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
