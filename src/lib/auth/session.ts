import type { UserRole } from "@/lib/mock-data";

export interface SessionUser {
  id?: string;
  name: string;
  email?: string;
  role: UserRole;
  scopedCompetitionIds: string[];
  source: "authjs" | "env_fallback";
}

const validRoles: UserRole[] = [
  "super_admin",
  "competition_admin",
  "content_editor",
  "student_user",
];

function parseBooleanEnv(raw: string | undefined, defaultValue: boolean) {
  if (raw === undefined) {
    return defaultValue;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function resolveFallbackRole() {
  const role = (process.env.MVP_SESSION_ROLE ?? "").trim() as UserRole;
  if (validRoles.includes(role)) {
    return role;
  }
  return "student_user";
}

function shouldAllowEnvFallback() {
  return parseBooleanEnv(
    process.env.MVP_ALLOW_ENV_SESSION_FALLBACK,
    process.env.NODE_ENV !== "production",
  );
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

  const fallbackName = process.env.MVP_SESSION_USER?.trim();
  const fallbackRole = process.env.MVP_SESSION_ROLE?.trim();
  const hasExplicitFallback = Boolean(fallbackName) || Boolean(fallbackRole);

  if (!hasExplicitFallback || !shouldAllowEnvFallback()) {
    return {
      name: "未登录用户",
      role: "student_user",
      scopedCompetitionIds: [],
      source: "env_fallback",
    };
  }

  const fallbackId = process.env.MVP_SESSION_USER_ID?.trim() || "USR-003";
  const fallbackScopes = process.env.MVP_SESSION_SCOPED_COMPETITIONS?.trim();

  return {
    id: fallbackId,
    name: fallbackName || "平台访客",
    role: resolveFallbackRole(),
    scopedCompetitionIds: fallbackScopes
      ? fallbackScopes.split(",").map((s) => s.trim())
      : [],
    source: "env_fallback",
  };
}
