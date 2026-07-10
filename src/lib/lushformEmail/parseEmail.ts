import {
  extractResponsesFromEmailHtml,
  resolveBrevoUrl,
  extractResumeUrl,
  extractSalaryResponses,
} from "../utils/utils";
import { FormResponse } from "@/types/types";

export async function parseLushformEmailHtml(html: string) {
  const source = "Lushform";

  if (!html) {
    return { source, message: "No HTML found" };
  }

  let responseUrl: string | undefined;
  const urlMatch = html.match(/href="(https:\/\/[^"]*\/tr\/cl\/[^"]*)"/);
  if (urlMatch) {
    const trackingUrl = urlMatch[1].replace(/&amp;/g, "&");
    responseUrl = await resolveBrevoUrl(trackingUrl);
  }

  const emailBody = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<img[^>]*width=["']?1["']?[^>]*>/gi, "")
    .replace(/ENCODED_RESPONSES:[\s\S]*?:END_ENCODED_RESPONSES/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  const formResponses: FormResponse[] | undefined =
    extractResponsesFromEmailHtml(html);
  const resumeUrl = extractResumeUrl(formResponses ?? []);
  if (!resumeUrl) {
    return { source, message: "No resume url found" };
  }
  const salaryResponses = extractSalaryResponses(formResponses ?? []);

  return {
    source,
    emailBody,
    fullApplicationUrl: responseUrl,
    formResponses,
    resumeUrl,
    salaryResponses,
    message: "OK",
  };
}
