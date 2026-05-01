export function sanitizeRichTextHtml(raw: string) {
  const normalized = raw.trim();
  if (!normalized) return "";

  const withoutBlocks = normalized
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

  const withoutEventHandlers = withoutBlocks
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=([^\s>]+)/gi, "");

  return withoutEventHandlers.replace(
    /\b(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi,
    `$1="#"`,
  );
}

export function extractPlainTextFromHtml(raw: string) {
  return raw
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
