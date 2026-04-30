import { and, eq, isNull } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { compare } from "bcryptjs";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { roleAssignments, users } from "@/lib/db/schema";
import type { UserRole } from "@/lib/mock-data";

const loginSchema = z.object({
  email: z.string().email("邮箱格式错误"),
  password: z.string().min(6, "密码至少 6 位"),
});

type AuthUserRole = UserRole;
const hasDb = isDatabaseConfigured();
const db = hasDb ? getDb() : null;

function pickPrimaryRole(roles: { role: AuthUserRole }[]): AuthUserRole {
  if (roles.some((item) => item.role === "super_admin")) return "super_admin";
  if (roles.some((item) => item.role === "competition_admin")) return "competition_admin";
  if (roles.some((item) => item.role === "content_editor")) return "content_editor";
  return "student_user";
}

async function resolveUserRole(userId: string) {
  if (!db) {
    return { role: "student_user" as AuthUserRole, scopedCompetitionIds: [] };
  }

  const records = await db
    .select({
      role: roleAssignments.role,
      competitionId: roleAssignments.competitionId,
    })
    .from(roleAssignments)
    .where(and(eq(roleAssignments.userId, userId), isNull(roleAssignments.revokedAt)));

  const role = pickPrimaryRole(records as { role: AuthUserRole }[]);
  const scopedCompetitionIds = records
    .map((item) => item.competitionId)
    .filter((item): item is string => Boolean(item));

  return { role, scopedCompetitionIds };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  logger: {
    error(error) {
      console.error("[auth:error]", error);
    },
    warn(code) {
      console.warn("[auth:warn]", code);
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(rawCredentials) {
        if (!db) {
          return null;
        }

        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user || !user.passwordHash) {
          return null;
        }

        const ok = await compare(password, user.passwordHash);
        if (!ok) {
          return null;
        }

        const { role, scopedCompetitionIds } = await resolveUserRole(user.id);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role as AuthUserRole,
          scopedCompetitionIds,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const mutableToken = token as typeof token & {
        uid?: string;
        role?: AuthUserRole;
        scopedCompetitionIds?: string[];
      };
      if (user) {
        mutableToken.uid = user.id;
        mutableToken.role = (user as { role?: AuthUserRole }).role ?? "student_user";
        mutableToken.scopedCompetitionIds =
          (user as { scopedCompetitionIds?: string[] }).scopedCompetitionIds ?? [];
      }
      return mutableToken;
    },
    async session({ session, token }) {
      const typedToken = token as typeof token & {
        uid?: string;
        role?: AuthUserRole;
        scopedCompetitionIds?: string[];
      };

      const role = typedToken.role ?? "student_user";
      const scopedCompetitionIds =
        typedToken.scopedCompetitionIds ?? [];
      const userId = typedToken.uid ?? typedToken.sub;

      if (session.user) {
        session.user.id = userId ?? "";
        session.user.role = role;
        session.user.scopedCompetitionIds = scopedCompetitionIds;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AuthUserRole;
      scopedCompetitionIds: string[];
    };
  }

  interface User {
    role?: AuthUserRole;
    scopedCompetitionIds?: string[];
  }
}
