"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  ListPlus,
  LineChart,
  Sparkles,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/log", label: "Log", icon: ListPlus },
  { href: "/trends", label: "Trends", icon: LineChart },
  { href: "/coach", label: "Coach", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="surface fixed inset-x-0 bottom-4 mx-auto flex w-[min(19rem,calc(100%-2rem))] items-center justify-between gap-2 px-4 py-2 shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-slate-400 transition-colors"
            aria-label={item.label}
            data-active={isActive}
          >
            <Icon
              className={`h-5 w-5 transition-colors ${
                isActive ? "text-sky-400" : "text-slate-500"
              }`}
            />
            <span
              className={`transition-colors ${
                isActive ? "text-slate-50" : "text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
