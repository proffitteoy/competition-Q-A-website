import { PortalFaq } from "@/components/marketing/portal-faq";
import { PortalFeaturedCompetitions } from "@/components/marketing/portal-featured-competitions";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalHero } from "@/components/marketing/portal-hero";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { PortalNoticeBoard } from "@/components/marketing/portal-notice-board";
import { PortalQuickLinks } from "@/components/marketing/portal-quick-links";
import { PortalResourceBoard } from "@/components/marketing/portal-resource-board";
import { auth } from "@/lib/auth/auth";
import { getHomepagePortalData } from "@/server/repositories/homepage-repository";

export default async function HomePage() {
  const [session, homepageData] = await Promise.all([
    auth(),
    getHomepagePortalData(),
  ]);

  const registrationOpenCount = homepageData.featuredCompetitions.filter(
    (competition) => competition.status === "registration_open",
  ).length;

  const quickLinks = [
    {
      href: "/competitions",
      label: "报名中赛事",
      value: `${registrationOpenCount} 项`,
      description: "优先查看当前开放报名和近期将开始的重点比赛。",
    },
    {
      href: "/#latest-notices",
      label: "最新通知",
      value: `${homepageData.latestNotices.length} 条`,
      description: "已发布公告统一回到比赛详情页查看完整安排。",
    },
    {
      href: "/#resource-library",
      label: "资料入口",
      value: `${homepageData.resourceLibrary.length} 份`,
      description: "报名模板、说明文档和常用资料集中收拢。",
    },
    {
      href: session?.user ? "/me/applications" : "/sign-in",
      label: "我的报名",
      value: session?.user ? "已登录" : "去登录",
      description: session?.user
        ? "查看提交记录、审核进度与后续补充要求。"
        : "登录后可查看个人报名记录与审核状态。",
    },
  ];

  const currentUser = session?.user
    ? {
        name: session.user.name ?? "未命名用户",
        role: session.user.role,
      }
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#fcfbf8_38%,#f5f1e8_100%)]">
      <PortalNavbar currentUser={currentUser} />
      <PortalHero
        featuredCompetitions={homepageData.featuredCompetitions}
        currentUser={currentUser}
      />
      <PortalQuickLinks items={quickLinks} />
      <PortalFeaturedCompetitions
        competitions={homepageData.featuredCompetitions.slice(0, 3)}
      />
      <PortalNoticeBoard notices={homepageData.latestNotices} />
      <PortalResourceBoard resources={homepageData.resourceLibrary} />
      <PortalFaq faqs={homepageData.featuredFaqs} />
      <PortalFooter />
    </div>
  );
}
