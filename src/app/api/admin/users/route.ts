import { NextResponse } from "next/server";

import { isSuperAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { listCompetitions } from "@/server/repositories/competition-repository";
import { listAdminUsers } from "@/server/repositories/user-repository";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!isSuperAdminRole(sessionUser.role)) {
    return NextResponse.json({ message: "无权访问" }, { status: 403 });
  }

  const [users, competitions] = await Promise.all([
    listAdminUsers(),
    listCompetitions(),
  ]);

  return NextResponse.json({
    users,
    competitions: competitions.map((item) => ({
      id: item.id,
      title: item.title,
    })),
  });
}
