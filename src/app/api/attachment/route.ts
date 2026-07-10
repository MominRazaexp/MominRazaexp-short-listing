import { NextRequest, NextResponse } from "next/server";
import { getGmail } from "@/lib/gmail/client";

export async function GET(req: NextRequest) {
  try {
    const messageId = req.nextUrl.searchParams.get("messageId");
    const attachmentId = req.nextUrl.searchParams.get("attachmentId");
    const mimeType = req.nextUrl.searchParams.get("mime") || "application/octet-stream";
    const filename = req.nextUrl.searchParams.get("filename") || "resume";
    const origin = req.nextUrl.origin;

    if (!messageId || !attachmentId) {
      return NextResponse.json({ error: "Missing messageId or attachmentId" }, { status: 400 });
    }

    const gmail = await getGmail(origin);

    const attachment = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId,
    });

    const buf = Buffer.from(attachment.data.data!, "base64url");

    return new NextResponse(buf, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}