"use client"

import * as React from "react"
import {
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  ListFilter,
  Megaphone,
  Settings2,
  Trophy,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "学院竞赛管理员",
    email: "admin@college.example",
    avatar: "",
  },
  navGroups: [
    {
      label: "总览",
      items: [
        {
          title: "后台首页",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "门户首页",
          url: "/",
          icon: Home,
        },
      ],
    },
    {
      label: "业务管理",
      items: [
        {
          title: "比赛管理",
          url: "/admin/competitions",
          icon: Trophy,
        },
        {
          title: "报名审核",
          url: "/admin/applications",
          icon: ClipboardCheck,
        },
        {
          title: "通知管理",
          url: "/admin/notices",
          icon: Megaphone,
        },
        {
          title: "用户管理",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "赛程安排",
          url: "/admin/schedule",
          icon: Calendar,
        },
      ],
    },
    {
      label: "工具与视图",
      items: [
        {
          title: "我的报名",
          url: "/me/applications",
          icon: FileSpreadsheet,
        },
        {
          title: "公共页面",
          url: "#",
          icon: ListFilter,
          items: [
            {
              title: "比赛列表",
              url: "/competitions",
            },
            {
              title: "登录页",
              url: "/sign-in",
            },
            {
              title: "通知公告",
              url: "/admin/notices",
            },
          ],
        },
        {
          title: "平台管理",
          url: "#",
          icon: Settings2,
          items: [
            {
              title: "管理员账号",
              url: "/admin/users",
            },
            {
              title: "比赛配置",
              url: "/admin/competitions",
            },
            {
              title: "通知中心",
              url: "/admin/notices",
            },
          ],
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">学院竞赛平台</span>
                  <span className="truncate text-xs">管理工作台</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
