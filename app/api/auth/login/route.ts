import { setVerifiedUser } from "@/db/user.db";
import { loginSchema, parseBody } from "@/lib/sanatize.lib";

import { NextRequest, NextResponse } from "next/server";


export async function PUT(req: NextRequest) {
  const body = await parseBody(req, loginSchema)

  if ("error" in body){
    return body.error
  }

  const uid = body?.data.uid
  const email = body?.data.email
  const name = body?.data.name

  if (!uid) {
    return NextResponse.json({
      message: "User does not exist",
      status: 400,
    });
  }


  const { user } = await setVerifiedUser(uid, email, name);
  if (!user) {
    return NextResponse.json({
      message: "User does not exist",
      status: 307,
    });
  }

  return NextResponse.json({
    message: "Successful Login",
    status: 200,
    success: true,
    app_user: user,
  });
}
