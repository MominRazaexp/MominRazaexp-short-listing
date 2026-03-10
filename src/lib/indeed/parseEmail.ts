import type { CandidateProfile } from "@/types/candidate";
import { decodeHtmlUrl, extractSalaryQA } from "../utils/merge";

export type IndeedParsed = Partial<CandidateProfile> & {
  jobLocation?: string;
  fullApplicationUrl?: string;
  saferedirectUrl?: string;
  resumeUrl?: string;
  resumeDownloadUrl?: string; 
  message?: string;
};

export function parseIndeedEmailHtml(html: string): IndeedParsed {
  const source =
    /indeed\.com/i.test(html) || /Indeed Sans/i.test(html)
      ? "Indeed"
      : undefined;
  const screenerQA = extractSalaryQA(html)
  
  const titleMatch = html.match(/<tr><td[^>]*>\s*<p[^>]*>\s*([^<]+?)\s*<\/p>/i);

  let jobTitle: string | undefined;
  let jobLocation: string | undefined;

  if (titleMatch) {
    const fullText = titleMatch[1].trim();
    const parts = fullText.split("•");
    jobTitle = (parts[0] || "").trim() || undefined;
    jobLocation = (parts[1] || "").trim() || undefined;
  }

  let fullApplicationUrl: string | undefined;

  let fullAppMatch = html.match(/<a[^>]*href="([^"]+)"[^>]*>\s*See full application/iu);

  if (!fullAppMatch) {
    fullAppMatch = html.match(
      /<h1[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?applied/iu
    );
  }

  if (fullAppMatch?.[1]) {
    fullApplicationUrl = decodeHtmlUrl(fullAppMatch[1]) || undefined;
  }

  let availability = "";
  const availabilityRegex =
    /Please mention your notice period and your availability to join[\s\S]*?<td[^>]*border-left[^>]*>\s*<p[^>]*>\s*([^<]+?)\s*<\/p>/i;

  const availabilityMatch = html.match(availabilityRegex);
  if (availabilityMatch?.[1]) availability = availabilityMatch[1].trim();

  let interviewAvailability = "";
  const interviewAvailabilityRegex =
    /(interview availability|availability for interview|available for an interview|what is your interview availability\?|when are you available for an interview\?)[\s\S]*?<td[^>]*border-left[^>]*>\s*<p[^>]*>\s*([^<]+?)\s*<\/p>/i;

  const interviewAvailabilityMatch = html.match(interviewAvailabilityRegex);
  if (interviewAvailabilityMatch?.[2]) interviewAvailability = interviewAvailabilityMatch[2].trim();

  const resumeRegex = /<a[^>]*href="([^"]+)"[^>]*>\s*View resume/iu;
  const resumeMatch = html.match(resumeRegex);

  if (!resumeMatch?.[1]) {
    return {
      source,
      jobTitle,
      jobLocation,
      fullApplicationUrl,
      availability,
      interviewAvailability,
      screenerQA,
      saferedirectUrl: undefined,
      resumeUrl: undefined,
      message: "No resume link found",
    };
  }

  const resumeUrl = decodeHtmlUrl(resumeMatch[1]) || undefined;

  return {
    source,
    jobTitle,
    jobLocation,
    fullApplicationUrl,
    availability,
    interviewAvailability,
    screenerQA,
    saferedirectUrl: resumeUrl,
    resumeUrl,
    cvLink: resumeUrl,
    message: "OK",
  };
}
