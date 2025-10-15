import { cookies } from "next/headers";
import { TIMEZONE_COOKIE } from "./timezone-constants";

export async function readTimezoneOffsetFromCookies(): Promise<
  number | undefined
> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TIMEZONE_COOKIE)?.value;
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export { TIMEZONE_COOKIE };
