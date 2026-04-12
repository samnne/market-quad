import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
 
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const role = auth.user 
  if (role.name !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, adminNote, unhideUser } = await req.json();
  const report = await prisma.report.update({
    where: { id: params.id },
    data: {
      status,
      adminNote,
      resolvedAt: ["RESOLVED", "DISMISSED"].includes(status) ? new Date() : undefined,
      resolvedById: auth.user.uid,
    },
  });
  
  // Admin can manually un-hide a user when dismissing
  if (unhideUser && status === "DISMISSED") {
    await prisma.user.update({
      where: { uid: report.targetUserId },
      data: { hidden: false },
    });
  }

  return NextResponse.json({ report });
}