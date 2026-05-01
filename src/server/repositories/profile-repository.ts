import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { users, userProfiles } from "@/lib/db/schema";
import {
  getPublishedPostsForUser,
  getPublishedPostById,
  type ExperiencePostRow,
} from "@/server/repositories/experience-post-repository";
import {
  users as mockUsers,
  hallOfFameEntries as mockHallOfFame,
  experiencePosts as mockExperience,
  type HallOfFameEntry,
  type ExperiencePost,
} from "@/lib/mock-data";

export interface PublicExperiencePost {
  id: string;
  userId: string;
  userName: string;
  competitionTitle: string;
  title: string;
  content: string;
  awardLevel: string;
  coverImage: string | null;
  publishedAt: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  college: string | null;
  image: string | null;
  hallOfFame: HallOfFameEntry;
  experiencePosts: PublicExperiencePost[];
}

function mockToPublicPost(p: ExperiencePost): PublicExperiencePost {
  return {
    id: p.id,
    userId: p.userId,
    userName: p.userName,
    competitionTitle: p.competitionTitle,
    title: p.title,
    content: p.content,
    awardLevel: p.awardLevel,
    coverImage: p.coverImage,
    publishedAt: p.publishedAt,
  };
}

function dbToPublicPost(
  r: ExperiencePostRow,
  userName: string,
): PublicExperiencePost {
  return {
    id: r.id,
    userId: r.userId,
    userName,
    competitionTitle: r.competitionTitle ?? "",
    title: r.title,
    content: r.content,
    awardLevel: r.awardLevel ?? "",
    coverImage: r.coverImage,
    publishedAt: r.publishedAt
      ? r.publishedAt.toISOString().slice(0, 10)
      : r.createdAt.toISOString().slice(0, 10),
  };
}

export function getHallOfFameEntries(): HallOfFameEntry[] {
  return [...mockHallOfFame].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export async function getPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  const hofEntry = mockHallOfFame.find((e) => e.userId === userId);
  if (!hofEntry) {
    return null;
  }

  if (isDatabaseConfigured()) {
    const db = getDb();
    const userRow = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (userRow) {
      const profileRow = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
      });

      const showCollege = profileRow?.publicShowCollegeMajor ?? true;
      const showAvatar = profileRow?.publicShowAvatar ?? true;

      let posts: PublicExperiencePost[];
      try {
        const dbPosts = await getPublishedPostsForUser(userId);
        posts = dbPosts.map((p) => dbToPublicPost(p, userRow.name));
      } catch {
        const mockPosts = mockExperience.filter(
          (p) => p.userId === userId && p.isPublished,
        );
        posts = mockPosts.map(mockToPublicPost);
      }

      return {
        id: userRow.id,
        name: userRow.name,
        college: showCollege ? userRow.college : null,
        image: showAvatar ? userRow.image : null,
        hallOfFame: hofEntry,
        experiencePosts: posts,
      };
    }
  }

  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    return null;
  }

  const mockPosts = mockExperience.filter(
    (p) => p.userId === userId && p.isPublished,
  );

  return {
    id: user.id,
    name: user.name,
    college: user.college,
    image: null,
    hallOfFame: hofEntry,
    experiencePosts: mockPosts.map(mockToPublicPost),
  };
}

export async function getPublishedExperiencePost(
  userId: string,
  postId: string,
): Promise<PublicExperiencePost | null> {
  if (isDatabaseConfigured()) {
    try {
      const dbPost = await getPublishedPostById(postId);
      if (dbPost && dbPost.userId === userId) {
        const db = getDb();
        const userRow = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });
        return dbToPublicPost(dbPost, userRow?.name ?? "");
      }
    } catch {
      // fall through to mock
    }
  }

  const post = mockExperience.find(
    (p) => p.id === postId && p.userId === userId && p.isPublished,
  );
  return post ? mockToPublicPost(post) : null;
}
