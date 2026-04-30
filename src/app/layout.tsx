import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter, mono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "学院竞赛管理与问答平台",
  description: "面向学院竞赛发布、报名、审核与问答沉淀的一体化平台骨架。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${mono.variable} antialiased`}>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <SidebarConfigProvider>
            {children}
            <Toaster richColors position="top-center" />
          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
