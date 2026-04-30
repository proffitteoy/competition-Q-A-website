import { redirect } from "next/navigation";

import { isAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  const hasExplicitFallback =
    Boolean(process.env.MVP_SESSION_ROLE) || Boolean(process.env.MVP_SESSION_USER);

  if (sessionUser.source === "env_fallback" && !hasExplicitFallback) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  if (!isAdminRole(sessionUser.role)) {
    redirect("/errors/forbidden");
  }

  return children;
}
