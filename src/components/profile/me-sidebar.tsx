"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileSpreadsheet, Trophy, Award } from "lucide-react";

import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/me/profile", label: "我的信息", icon: User },
  { href: "/me/applications", label: "我的报名", icon: FileSpreadsheet },
  { href: "/me/achievements", label: "我的成果", icon: Award },
  { href: "/me/hall-of-fame", label: "名人堂展示", icon: Trophy },
];

interface MeSidebarProps {
  variant?: "sidebar" | "tabs";
}

export function MeSidebar({ variant = "sidebar" }: MeSidebarProps) {
  const pathname = usePathname();

  if (variant === "tabs") {
    return (
      <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
