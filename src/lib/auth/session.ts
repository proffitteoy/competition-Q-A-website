import type { UserRole } from "@/lib/mock-data";

export interface SessionUser {
  id?: string;
  name: string;
  email?: string;
  role: UserRole;
  scopedCompetitionIds: string[];
  source: "authjs" | "env_fallback";
}

/**
 * MVP 先用环境变量模拟会话用户。
 * 若 Auth.js session 可用，则优先使用真实会话。
 */
export async function getSessionUser(): Promise<SessionUser> {
  try {
    const { auth } = await import("@/lib/auth/auth");
    const session = await auth();
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name ?? "未命名用户",
        email: session.user.email ?? undefined,
        role: session.user.role,
        scopedCompetitionIds: session.user.scopedCompetitionIds ?? [],
        source: "authjs",
      };
    }
  } catch {
    // 数据库或 Auth.js 尚未初始化时，回退到环境变量会话。
  }

  const role = (process.env.MVP_SESSION_ROLE ?? "super_admin") as UserRole;
  const name = process.env.MVP_SESSION_USER ?? "平台管理员";
  return { name, role, scopedCompetitionIds: [], source: "env_fallback" };
}
