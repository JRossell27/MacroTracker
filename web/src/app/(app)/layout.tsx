import type { ReactNode } from "react";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col gap-6 px-4 pb-24 pt-6">
      <div className="flex flex-1 flex-col gap-6">{children}</div>
      <MobileNav />
    </div>
  );
}
