import { notFound } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { getMyExperiencePost } from "@/server/repositories/experience-post-repository";
import { ExperiencePostEditor } from "@/components/profile/experience-post-editor";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePostPage({
  params,
}: EditPageProps) {
  const sessionUser = await getSessionUser();
  const { id } = await params;
  const post = await getMyExperiencePost(sessionUser.id!, id);

  if (!post) {
    notFound();
  }

  if (post.status !== "draft" && post.status !== "offline") {
    notFound();
  }

  return (
    <ExperiencePostEditor
      postId={post.id}
      defaultValues={{
        title: post.title,
        competitionTitle: post.competitionTitle ?? "",
        awardLevel: post.awardLevel ?? "",
        content: post.content,
      }}
    />
  );
}
