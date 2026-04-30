import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { roleAssignments, users } from "@/lib/db/schema";

const registerSchema = z.object({
  name: z.string().min(2, "请输入姓名"),
  studentId: z.string().min(6, "请输入有效学号"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少需要 6 位"),
});

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = registerSchema.parse(await request.json());

    const emailExists = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (emailExists) {
      return NextResponse.json({ message: "该邮箱已注册" }, { status: 409 });
    }

    const studentExists = await db.query.users.findFirst({
      where: eq(users.studentNo, body.studentId),
    });
    if (studentExists) {
      return NextResponse.json({ message: "该学号已注册" }, { status: 409 });
    }

    const passwordHash = await hash(body.password, 10);
    const created = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        studentNo: body.studentId,
        passwordHash,
        status: "active",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    const createdUser = created[0];
    if (!createdUser) {
      throw new Error("创建账号失败");
    }

    await db.insert(roleAssignments).values({
      userId: createdUser.id,
      role: "student_user",
      scopeType: "global",
    });

    return NextResponse.json(
      {
        user: createdUser,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "注册失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
