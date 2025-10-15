import { cookies } from "next/headers";
import { TIMEZONE_COOKIE } from "./timezone-constants";

export function readTimezoneOffsetFromCookies(): number | undefined {
  const raw = cookies().get(TIMEZONE_COOKIE)?.value;
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export { TIMEZONE_COOKIE };
