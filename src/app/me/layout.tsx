import { redirect } from "next/navigation";

import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { MeSidebar } from "@/components/profile/me-sidebar";
import { getSessionUser } from "@/lib/auth/session";

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser.id) {
    redirect("/sign-in?callbackUrl=/me");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#fcfbf8_38%,#f5f1e8_100%)]">
      <PortalNavbar
        currentUser={{ name: sessionUser.name, role: sessionUser.role }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="hidden w-60 shrink-0 md:block">
            <MeSidebar />
          </aside>
          <div className="md:hidden">
            <MeSidebar variant="tabs" />
          </div>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <PortalFooter />
    </div>
  );
}
