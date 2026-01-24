import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Newspaper } from "lucide-react";

export default function EmptyFeed() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Newspaper />
        </EmptyMedia>
        <EmptyTitle>No Posts Today :)</EmptyTitle>
        <EmptyDescription>
          We are busy curating the best content spread across the internet.
          Check in after some time.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
