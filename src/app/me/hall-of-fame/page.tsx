import { getSessionUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db/config";
import { hallOfFameEntries as mockHallOfFame } from "@/lib/mock-data";
import { getForUser } from "@/server/repositories/hall-of-fame-repository";
import { getMeProfile } from "@/server/repositories/me-profile-repository";
import { PageHeader } from "@/components/shared/page-header";
import { HallOfFameStatusCard } from "@/components/profile/hall-of-fame-status-card";

export default async function MyHallOfFamePage() {
  const sessionUser = await getSessionUser();
  const userId = sessionUser.id!;

  const profile = await getMeProfile(userId);

  let entry: { tag: string; bio: string } | null = null;

  if (isDatabaseConfigured()) {
    try {
      const dbEntry = await getForUser(userId);
      if (dbEntry) {
        entry = { tag: dbEntry.tag, bio: dbEntry.adminBio ?? dbEntry.bio };
      }
    } catch {
      // fall through to mock
    }
  }

  if (!entry) {
    const mockEntry = mockHallOfFame.find((e) => e.userId === userId);
    if (mockEntry) {
      entry = { tag: mockEntry.tag, bio: mockEntry.bio };
    }
  }

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
