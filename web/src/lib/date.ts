export function getLocalISODate(
  date = new Date(),
  timezoneOffsetMinutes?: number,
) {
  const effectiveOffset =
    typeof timezoneOffsetMinutes === "number" && Number.isFinite(timezoneOffsetMinutes)
      ? timezoneOffsetMinutes
      : date.getTimezoneOffset();
  const tzOffsetMs = effectiveOffset * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export function formatDisplayDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function parseISODate(date: string) {
  return new Date(`${date}T00:00:00`);
}
