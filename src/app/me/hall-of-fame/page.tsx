import { getSessionUser } from "@/lib/auth/session";
import { hallOfFameEntries } from "@/lib/mock-data";
import { getMeProfile } from "@/server/repositories/me-profile-repository";
import { PageHeader } from "@/components/shared/page-header";
import { HallOfFameStatusCard } from "@/components/profile/hall-of-fame-status-card";

export default async function MyHallOfFamePage() {
  const sessionUser = await getSessionUser();
  const userId = sessionUser.id!;

  const [profile, entry] = await Promise.all([
    getMeProfile(userId),
    Promise.resolve(hallOfFameEntries.find((e) => e.userId === userId) ?? null),
  ]);

  const displaySettings = {
    publicShowAvatar: profile?.profile?.publicShowAvatar ?? true,
    publicShowCollegeMajor: profile?.profile?.publicShowCollegeMajor ?? true,
    publicShowTitles: profile?.profile?.publicShowTitles ?? true,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="个人中心"
        title="名人堂展示"
        description="查看入选状态、公开页预览与展示设置"
      />
      <HallOfFameStatusCard
        entry={entry}
        userId={userId}
        userName={sessionUser.name}
        displaySettings={displaySettings}
      />
    </div>
  );
}
