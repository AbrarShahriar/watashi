"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";

interface Props {
  activeIf: string | number;
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children, activeIf }: Props) {
  const pathname = usePathname();
  const sortCriteria = pathname == "/new" ? "new" : "top";

  return (
    <Link href={href}>
      <Button
        variant={sortCriteria == activeIf ? "secondary" : "ghost"}
        size="sm"
        className="text-xs h-8"
      >
        {children}
      </Button>
    </Link>
  );
}
