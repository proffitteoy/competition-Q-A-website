import { redirect } from "next/navigation";

import { isSuperAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  if (!isSuperAdminRole(sessionUser.role)) {
    redirect("/errors/forbidden");
  }

  return children;
}
