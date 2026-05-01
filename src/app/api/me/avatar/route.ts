import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import { users } from "@/lib/db/schema";
import { uploadFilesService } from "@/server/services/upload-service";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "请选择头像文件。" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "仅支持 PNG 和 JPG 格式的图片。" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "头像文件不能超过 2MB。" },
        { status: 400 },
      );
    }

    const uploaded = await uploadFilesService({
      files: [file],
      scope: "avatar",
    });

    const publicUrl = uploaded[0]?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ message: "上传失败。" }, { status: 500 });
    }

    if (isDatabaseConfigured()) {
      const db = getDb();
      await db
        .update(users)
        .set({ image: publicUrl, updatedAt: new Date() })
        .where(eq(users.id, sessionUser.id));
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[me/avatar] upload failed:", error);
    return NextResponse.json(
      { message: "头像上传失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
