import {
  users as mockUsers,
  hallOfFameEntries as mockHallOfFame,
  experiencePosts as mockExperience,
  type HallOfFameEntry,
  type ExperiencePost,
  type PlatformUser,
} from "@/lib/mock-data";

export interface PublicProfile {
  id: string;
  name: string;
  college: string;
  image: string | null;
  hallOfFame: HallOfFameEntry;
  experiencePosts: ExperiencePost[];
}

export function getHallOfFameEntries(): HallOfFameEntry[] {
  return [...mockHallOfFame].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export function getPublicProfile(userId: string): PublicProfile | null {
  const hofEntry = mockHallOfFame.find((e) => e.userId === userId);
  if (!hofEntry) {
    return null;
  }

  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    return null;
  }

  const posts = mockExperience.filter(
    (p) => p.userId === userId && p.isPublished,
  );

  return {
    id: user.id,
    name: user.name,
    college: user.college,
    image: null,
    hallOfFame: hofEntry,
    experiencePosts: posts,
  };
}

export function getPublishedExperiencePost(
  userId: string,
  postId: string,
): ExperiencePost | null {
  const post = mockExperience.find(
    (p) => p.id === postId && p.userId === userId && p.isPublished,
  );
  return post ?? null;
}
