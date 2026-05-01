const APP_TIME_ZONE =
  process.env.APP_TIME_ZONE?.trim() || process.env.TZ?.trim() || "Asia/Shanghai";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatFromParts(
  value: Date,
  formatter: Intl.DateTimeFormat,
  includeTime: boolean,
) {
  const parts = formatter.formatToParts(value);
  const map = new Map(parts.map((part) => [part.type, part.value]));
  const dateText = `${map.get("year")}-${map.get("month")}-${map.get("day")}`;

  if (!includeTime) {
    return dateText;
  }

  return `${dateText} ${map.get("hour")}:${map.get("minute")}`;
}

export function getAppTimeZone() {
  return APP_TIME_ZONE;
}

export function formatAppDate(value: Date | null | undefined, emptyText = "TBD") {
  if (!value) return emptyText;
  return formatFromParts(value, dateFormatter, false);
}

export function formatAppDateTime(
  value: Date | null | undefined,
  emptyText = "-",
) {
  if (!value) return emptyText;
  return formatFromParts(value, dateTimeFormatter, true);
}
