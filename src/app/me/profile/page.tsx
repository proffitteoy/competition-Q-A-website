import { getSessionUser } from "@/lib/auth/session";
import { getMeProfile } from "@/server/repositories/me-profile-repository";
import { resolveUserTitles } from "@/server/services/user-title-service";
import { ProfileView } from "@/components/profile/profile-view";

export default async function MyProfilePage() {
  const sessionUser = await getSessionUser();

  const [profileData, titles] = await Promise.all([
    getMeProfile(sessionUser.id!),
    resolveUserTitles(sessionUser.id!),
  ]);

  return <ProfileView initialData={profileData} titles={titles} />;
}
