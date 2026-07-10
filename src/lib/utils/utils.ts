import { getGmail } from "../gmail/client";
import { FormResponse } from "@/types/types";

export function decodePubSubData(b64: string) {
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json) as { emailAddress: string; historyId: string };
}

export function parseAllowedFrom(): string[] {
  const raw = process.env.GMAIL_ALLOWED_FROM || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function getFromHeader(messageId: string, origin: string): Promise<string> { 
  const gmail = await getGmail(origin);
  const msg = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["From"],
  });

  const headers = msg.data.payload?.headers || [];
  const from = headers.find((h) => (h.name || "").toLowerCase() === "from")?.value || "";
  return from.toLowerCase();
}

export function matchesAllowed(fromHeaderLower: string, allowed: string[]) {

  return allowed.some((a) => fromHeaderLower.includes(a));
}

export async function listNewMessageIds(startHistoryId: string, origin: string) {
  const gmail = await getGmail(origin);
  const ids: string[] = [];
  let pageToken: string | undefined;

  while (true) {
    const res = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      historyTypes: ["messageAdded"],
      labelId: "INBOX",
      pageToken,
    });

    for (const h of res.data.history || []) {
      for (const added of h.messagesAdded || []) {
        if (added.message?.id) ids.push(added.message.id);
      }
    }

    pageToken = res.data.nextPageToken || undefined;
    if (!pageToken) break;
  }

  return Array.from(new Set(ids));
}

export function isAuthorized(req: Request) {
  const cron = process.env.CRON_SECRET || "";
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  if (!cron) return true;           // allow if not set (not recommended)
  return bearer === cron;
}

export function isGarbageText(text: string) {
  if (!text) return true;

  const clean = text.trim();

  if (clean.length < 50) return true;

  const nonAlphaRatio =
    clean.replace(/[a-zA-Z0-9\s.,]/g, "").length / clean.length;

  return nonAlphaRatio > 0.3;
}

export function extractResponsesFromEmailHtml(html: string) {
  const divMatch = html.match(
    /ENCODED_RESPONSES:([\s\S]*?):END_ENCODED_RESPONSES/
  );

  if (!divMatch || !divMatch[1]) return null;

  try {
    const cleaned = divMatch[1]
      .replace(/=\r?\n/g, "")
      .replace(/=3D/g, "=")
      .trim();

    const decoded = Buffer.from(cleaned, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode responses:", e);
    throw new Error("Failed to decode responses");
  }
}

export async function resolveBrevoUrl(
  trackingUrl: string
): Promise<string | undefined> {
  try {
    const response = await fetch(trackingUrl, {
      method: "GET",
      redirect: "follow",
    });
    const finalUrl = response.url;
    if (finalUrl && finalUrl.includes("/submitted/")) {
      return finalUrl;
    }
  } catch (e) {
    return undefined;
  }
}

export function extractResumeUrl(
  formResponses: FormResponse[]
): string | undefined {
  const resumeKeywords = ["cv", "resume", "curriculum"];
  const uploadKeywords = ["upload", "attach"];
  const excludeKeywords = ["cover letter", "image", "photo", "picture"];

  const resumeEntry = formResponses?.find((entry) => {
    const question = entry.question.toLowerCase();

    const isExcluded = excludeKeywords.some((keyword) =>
      question.includes(keyword)
    );
    if (isExcluded) return false;

    const hasDirectKeyword = resumeKeywords.some((keyword) =>
      question.includes(keyword)
    );
    const hasUploadKeyword = uploadKeywords.some((keyword) =>
      question.includes(keyword)
    );

    return hasDirectKeyword || hasUploadKeyword;
  });

  return resumeEntry?.answer?.startsWith("http")
    ? resumeEntry.answer
    : undefined;
}

export function extractSalaryResponses(
  formResponses: FormResponse[]
): FormResponse[] {
  const salaryKeywords = ["salary", "package"];

  return formResponses.filter((entry) =>
    salaryKeywords.some((keyword) =>
      entry.question.toLowerCase().includes(keyword)
    )
  );
}
