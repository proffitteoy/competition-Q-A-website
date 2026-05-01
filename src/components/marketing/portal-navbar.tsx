"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, LogOut, ScrollText, Trophy } from "lucide-react";
import { getSession, signOut } from "next-auth/react";

import type { UserRole } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/competitions", label: "比赛列表" },
  { href: "/#latest-notices", label: "通知公告" },
  { href: "/#resource-library", label: "报名资料" },
  { href: "/#hall-of-fame", label: "名人堂" },
];

interface PortalCurrentUser {
  name: string;
  role: UserRole;
}

interface PortalNavbarProps {
  currentUser?: PortalCurrentUser | null;
}

function canAccessAdmin(role: UserRole) {
  return role === "super_admin" || role === "competition_admin" || role === "content_editor";
}

function isHashNavigation(href: string) {
  return href.includes("#");
}

function PortalNavLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  if (isHashNavigation(href)) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function PortalNavbar({ currentUser }: PortalNavbarProps) {
  const [clientUser, setClientUser] = useState<PortalCurrentUser | null>(null);
  const resolvedUser = currentUser === undefined ? clientUser : currentUser;
  const showAdminEntry = resolvedUser ? canAccessAdmin(resolvedUser.role) : false;

  useEffect(() => {
    let active = true;

    if (currentUser !== undefined) {
      return () => {
        active = false;
      };
    }

    void getSession().then((session) => {
      if (!active) return;

      const sessionUser = session?.user;
      const role = (sessionUser as { role?: UserRole } | undefined)?.role;
      if (!sessionUser?.name || !role) {
        setClientUser(null);
        return;
      }

      setClientUser({
        name: sessionUser.name,
        role,
      });
    });

    return () => {
      active = false;
    };
  }, [currentUser]);

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[rgba(250,248,243,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_14px_35px_-18px_rgba(15,23,42,0.7)]">
            <Trophy className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              学院竞赛官方入口
            </div>
            <div className="text-base font-semibold text-slate-950">学院竞赛中心</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <PortalNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {resolvedUser ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
                <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-900">
                  <ScrollText className="size-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-950">{resolvedUser.name}</p>
                  <p className="text-xs text-slate-500">
                    {showAdminEntry ? "已登录，可进入管理台" : "已登录，可查看报名进度"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                asChild
                className="border-slate-300 bg-white/85 text-slate-900 hover:bg-slate-50"
              >
                <Link href="/me">个人中心</Link>
              </Button>
              {showAdminEntry ? (
                <Button
                  variant="outline"
                  asChild
                  className="border-slate-300 bg-white/85 text-slate-900 hover:bg-slate-50"
                >
                  <Link href="/admin">管理台</Link>
                </Button>
              ) : null}
              <Button
                variant="ghost"
                type="button"
                className="text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="size-4" />
                退出登录
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                className="border-slate-300 bg-white/85 text-slate-900 hover:bg-slate-50"
              >
                <Link href="/sign-in">登录</Link>
              </Button>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/competitions">查看全部比赛</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px]">
            <SheetTitle>学院竞赛中心</SheetTitle>
            <div className="mt-8 flex flex-col gap-5">
              {navLinks.map((link) => (
                <PortalNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  className="text-base font-medium text-slate-950"
                />
              ))}
              <Link
                href={resolvedUser ? "/me" : "/sign-in"}
                className="text-base font-medium text-slate-950"
              >
                {resolvedUser ? "个人中心" : "登录"}
              </Link>
              {showAdminEntry ? (
                <Link href="/admin" className="text-base font-medium text-slate-950">
                  管理台
                </Link>
              ) : null}
              <div className="mt-4 flex flex-col gap-3">
                {resolvedUser ? (
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    onClick={() => void handleSignOut()}
                  >
                    退出登录
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    >
                      <Link href="/sign-in">登录</Link>
                    </Button>
                    <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                      <Link href="/competitions">查看全部比赛</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
