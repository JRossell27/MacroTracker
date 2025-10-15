"use server";

import { cookies } from "next/headers";
import { TIMEZONE_COOKIE } from "@/lib/timezone-constants";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setTimezoneOffsetAction(offsetMinutes: number) {
  if (!Number.isFinite(offsetMinutes)) {
    return;
  }

  const coerced = Math.round(offsetMinutes);
  const cookieStore = await cookies();
  const existing = cookieStore.get(TIMEZONE_COOKIE)?.value;

  if (existing && Number(existing) === coerced) {
    return;
  }

  cookieStore.set({
    name: TIMEZONE_COOKIE,
    value: String(coerced),
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}
