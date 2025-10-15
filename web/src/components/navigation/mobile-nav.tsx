"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  ListPlus,
  LineChart,
  Sparkles,
  Settings,
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
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="surface fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(22rem,calc(100%-2rem))] items-center justify-between gap-2 px-3 py-2 shadow-xl backdrop-blur">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "group flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/70",
              isActive
                ? "bg-slate-800/70 text-slate-50 shadow-[0_10px_30px_rgba(8,112,184,0.35)]"
                : "text-slate-500 hover:text-slate-200",
            )}
            aria-label={item.label}
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={clsx(
                "h-5 w-5 transition-colors",
                isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-200",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
