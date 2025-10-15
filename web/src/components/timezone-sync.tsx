"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTimezoneOffsetAction } from "@/app/timezone/actions";
import { TIMEZONE_COOKIE } from "@/lib/timezone-constants";

function readCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.split("=")[1];
}

export function TimezoneSync() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const offset = new Date().getTimezoneOffset();
    const existingRaw = readCookieValue(TIMEZONE_COOKIE);
    const existing = existingRaw ? Number(existingRaw) : undefined;

    if (Number.isFinite(existing) && existing === offset) {
      return;
    }

    startTransition(async () => {
      await setTimezoneOffsetAction(offset);
      router.refresh();
    });
  }, []);

  return null;
}
