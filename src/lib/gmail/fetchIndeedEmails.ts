import { getGmail } from "./client";

export async function readEmailHtml(messageId: string, origin: string) {
  const gmail = await getGmail(origin);
  const msg = await gmail.users.messages.get({ userId: "me", id: messageId, format: "full" });
const headers = msg.data.payload?.headers || [];
const fromHeader = headers.find(h => h.name?.toLowerCase() === "from")?.value || "";
const subjectHeader = headers.find(h => h.name?.toLowerCase() === "subject")?.value || "";
console.log("HEADERS:", { fromHeader, subjectHeader });

  const parts = msg.data.payload?.parts || [];
  const htmlPart =
    parts.find(p => p.mimeType === "text/html") ||
    parts.flatMap(p => p.parts || []).find(p => p.mimeType === "text/html");

  const body = htmlPart?.body?.data;
  const html = body ? Buffer.from(body, "base64").toString("utf8") : "";

  return { html, threadId: msg.data.threadId || "", messageId };
}

export async function markAsRead(messageId: string, origin: string) {
  const gmail = await getGmail(origin);
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: { removeLabelIds: ["UNREAD"] }
  });
}
