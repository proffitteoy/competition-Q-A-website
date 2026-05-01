import { eq } from "drizzle-orm";

import type { SessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { users } from "@/lib/db/schema";

/**
 * 处理 JWT 会话与数据库用户脱节场景：
 * 数据库重置后，浏览器旧 token 里的 userId 可能已不存在。
 */
export async function resolveValidOperatorUserId(
  sessionUser: SessionUser,
): Promise<string | null> {
  const userId = sessionUser.id?.trim();
  if (!userId) {
    return null;
  }

  if (!isDatabaseConfigured()) {
    return userId;
  }

  try {
    const db = getDb();
    const row = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.id, userId),
    });
    return row?.id ?? null;
  } catch {
    return null;
  }
}

