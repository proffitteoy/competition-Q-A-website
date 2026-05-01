import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  getMissingRelationSetupMessage,
  isMissingRelationError,
} from "@/lib/db/errors";
import { users, userProfiles } from "@/lib/db/schema";

export interface MeProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    studentNo: string | null;
    college: string | null;
    major: string | null;
    grade: string | null;
    phone: string | null;
  };
  profile: {
    nickname: string | null;
    gender: "male" | "female" | "other" | null;
    birthday: string | null;
    schoolName: string | null;
    department: string | null;
    enrollmentYear: number | null;
    educationLevel: string | null;
    inSchoolStatus: "yes" | "no" | "graduated" | null;
    publicBio: string | null;
    skillTags: string[];
    publicShowAvatar: boolean;
    publicShowCollegeMajor: boolean;
    publicShowTitles: boolean;
  } | null;
}

export async function getMeProfile(
  userId: string,
): Promise<MeProfileData | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();

  const userRow = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!userRow) {
    return null;
  }

  const userData: MeProfileData["user"] = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    image: userRow.image,
    studentNo: userRow.studentNo,
    college: userRow.college,
    major: userRow.major,
    grade: userRow.grade,
    phone: userRow.phone,
  };

  let profileRow: Awaited<ReturnType<typeof db.query.userProfiles.findFirst>> | null =
    null;
  try {
    profileRow = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });
  } catch (error) {
    if (isMissingRelationError(error, "user_profile")) {
      return {
        user: userData,
        profile: null,
      };
    }
    throw error;
  }

  return {
    user: userData,
    profile: profileRow
      ? {
          nickname: profileRow.nickname,
          gender: profileRow.gender,
          birthday: profileRow.birthday
            ? profileRow.birthday.toISOString().slice(0, 10)
            : null,
          schoolName: profileRow.schoolName,
          department: profileRow.department,
          enrollmentYear: profileRow.enrollmentYear,
          educationLevel: profileRow.educationLevel,
          inSchoolStatus: profileRow.inSchoolStatus,
          publicBio: profileRow.publicBio,
          skillTags: profileRow.skillTags,
          publicShowAvatar: profileRow.publicShowAvatar,
          publicShowCollegeMajor: profileRow.publicShowCollegeMajor,
          publicShowTitles: profileRow.publicShowTitles,
        }
      : null,
  };
}

export interface UpdateMeProfileInput {
  name?: string;
  studentNo?: string;
  college?: string;
  major?: string;
  grade?: string;
  phone?: string;
  nickname?: string | null;
  gender?: "male" | "female" | "other" | null;
  birthday?: string | null;
  schoolName?: string | null;
  department?: string | null;
  enrollmentYear?: number | null;
  educationLevel?: string | null;
  inSchoolStatus?: "yes" | "no" | "graduated" | null;
  publicBio?: string | null;
  skillTags?: string[];
  publicShowAvatar?: boolean;
  publicShowCollegeMajor?: boolean;
  publicShowTitles?: boolean;
}

export async function updateMeProfile(
  userId: string,
  input: UpdateMeProfileInput,
): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error("数据库未配置，无法执行写操作。");
  }

  const db = getDb();
  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      const userUpdates: Record<string, unknown> = { updatedAt: now };
      if (input.name !== undefined) userUpdates.name = input.name;
      if (input.studentNo !== undefined) userUpdates.studentNo = input.studentNo;
      if (input.college !== undefined) userUpdates.college = input.college;
      if (input.major !== undefined) userUpdates.major = input.major;
      if (input.grade !== undefined) userUpdates.grade = input.grade;
      if (input.phone !== undefined) userUpdates.phone = input.phone;

      if (Object.keys(userUpdates).length > 1) {
        await tx.update(users).set(userUpdates).where(eq(users.id, userId));
      }

      const profileValues = {
        userId,
        nickname: input.nickname ?? null,
        gender: input.gender ?? null,
        birthday: input.birthday ? new Date(input.birthday) : null,
        schoolName: input.schoolName ?? null,
        department: input.department ?? null,
        enrollmentYear: input.enrollmentYear ?? null,
        educationLevel: input.educationLevel ?? null,
        inSchoolStatus: input.inSchoolStatus ?? null,
        publicBio: input.publicBio ?? null,
        skillTags: input.skillTags ?? [],
        publicShowAvatar: input.publicShowAvatar ?? true,
        publicShowCollegeMajor: input.publicShowCollegeMajor ?? true,
        publicShowTitles: input.publicShowTitles ?? true,
        updatedAt: now,
      };

      await tx
        .insert(userProfiles)
        .values({ ...profileValues, createdAt: now })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: profileValues,
        });
    });
  } catch (error) {
    const message = getMissingRelationSetupMessage(
      error,
      "user_profile",
      "个人资料",
    );
    if (message) {
      throw new Error(message);
    }
    throw error;
  }
}
