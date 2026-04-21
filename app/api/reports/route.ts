import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/db";

import { Resend } from "resend";
import { requireAuth } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUTO_HIDE_THRESHOLD = 3; 

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }

  const { targetUserId, reason, description } = await req.json();

  if (auth.user.uid === targetUserId) {
    return NextResponse.json(
      { error: "Cannot report yourself" },
      { status: 400 },
    );
  }

  // Prevent duplicate pending reports
  const existing = await prisma.report.findFirst({
    where: { reporterId: auth.user.uid, targetUserId, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending report for this user" },
      { status: 409 },
    );
  }

  const report = await prisma.report.create({
    data: { reporterId: auth.user.uid, targetUserId, reason, description },
  });

  // Auto-hide logic: check total pending/under-review reports for this user
  const reportCount = await prisma.report.count({
    where: { targetUserId, status: { in: ["PENDING", "UNDER_REVIEW"] } },
  });

  if (reportCount >= AUTO_HIDE_THRESHOLD) {
    await prisma.$transaction([
      prisma.user.update({
        where: { uid: targetUserId },
        data: { hidden: true },
      }),
      prisma.report.updateMany({
        where: { targetUserId, status: "PENDING" },
        data: { autoHidden: true, status: "UNDER_REVIEW" },
      }),
    ]);
  }

  // Email admins
  await resend.emails.send({
    from: process.env.ALERTS_EMAIL!,
    to: process.env.ADMIN_EMAIL!,
    subject: `New User Report — ${reason}`,
    html: `
      <h2>New Report Submitted</h2>
      <p><strong>Reported User ID:</strong> ${targetUserId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Description:</strong> ${description ?? "None provided"}</p>
      <p><strong>Auto-hidden:</strong> ${reportCount >= AUTO_HIDE_THRESHOLD ? "Yes" : "No"}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reports/${report.id}">Review Report</a>
    `,
  });

  return NextResponse.json({ report }, { status: 201 });
}

// Reporter fetches their own reports
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response
  }

  const reports = await prisma.report.findMany({
    where: { reporterId: auth.user.uid },
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      adminNote: true,
      targetUser: { select: { uid: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}

 