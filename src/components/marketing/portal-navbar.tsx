"use client";

import Link from "next/link";
import { Menu, Search, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/competitions", label: "比赛列表" },
  { href: "/me/applications", label: "我的报名" },
  { href: "/admin", label: "管理台" },
];

export function PortalNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Competition Hub
            </div>
            <div className="text-base font-semibold">学院竞赛中心</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" aria-label="搜索比赛">
            <Search className="size-4" />
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">登录</Link>
          </Button>
          <Button asChild>
            <Link href="/competitions">立即查看比赛</Link>
          </Button>
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
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Button variant="outline" asChild>
                  <Link href="/sign-in">登录</Link>
                </Button>
                <Button asChild>
                  <Link href="/competitions">立即查看比赛</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
