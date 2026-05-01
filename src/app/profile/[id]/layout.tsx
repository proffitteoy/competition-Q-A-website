import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { auth } from "@/lib/auth/auth";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const currentUser = session?.user
    ? {
        name: session.user.name ?? "未命名用户",
        role: session.user.role,
      }
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#fcfbf8_38%,#f5f1e8_100%)]">
      <PortalNavbar currentUser={currentUser} />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6">{children}</main>
      <PortalFooter />
    </div>
  );
}
