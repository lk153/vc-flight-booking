"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Search" },
  { href: "/trends", label: "Trends" },
  { href: "/alerts", label: "Alerts" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">✈</span>
          <span className="text-lg font-semibold text-primary">
            VN Flight Finder
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/search")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
