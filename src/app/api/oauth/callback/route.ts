import { NextResponse } from "next/server";
import { google } from "googleapis";
import { saveRefreshToken } from "@/lib/gmail/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  let isAllowed = false;
  if (!code) return NextResponse.json({ ok: false, error: "Missing ?code=" }, { status: 400 });
  const origin = `${u.protocol}//${u.host}`;

  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${origin}/api/oauth/callback`
  );

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  const oauth2Api = google.oauth2({ auth: oauth2, version: "v2" });
  const { data } = await oauth2Api.userinfo.get();
  const userEmail = data.email;

  if (!userEmail) {
    return NextResponse.redirect(`${origin}/no-access`);
  }
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(",").map((e) =>
    e.trim().toLowerCase()
  );


  if (allowedEmails && allowedEmails.includes(userEmail.toLowerCase())) {
    isAllowed = true;
  }
  if (!isAllowed) {
    return NextResponse.redirect(`${origin}/no-access`);
  }
  if (tokens.refresh_token) {
    await saveRefreshToken(tokens.refresh_token);
  }

  const response = NextResponse.redirect(`${origin}/dashboard?oauth_callback=true`);
  return response;
}