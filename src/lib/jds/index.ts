import type { JDPick } from "@/types/jd";
import { JobDescription } from "../models/JobDescription";

export async function decideJD(jobTitleRaw: string, subjectHeader: string): Promise<JDPick> {
  const jds = await JobDescription.find({ isActive: true });

  const findBestMatch = (text: string) => {
    const t = (text || "").toLowerCase();
    let bestMatch = null;
    let highestMatchCount = 0;

    for (const jd of jds) {
      const matchCount = jd.keywords.filter((keyword: string) =>
        t.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatch = jd;
      }
    }

    return { bestMatch, highestMatchCount };
  };

  const { bestMatch: subjectMatch, highestMatchCount: subjectCount } = findBestMatch(subjectHeader);

  if (subjectMatch && subjectCount > 0) {
    return {
      role: subjectMatch.role,
      jd: subjectMatch.jd,
    };
  }

  const { bestMatch: titleMatch } = findBestMatch(jobTitleRaw);

  if (titleMatch) {
    return {
      role: titleMatch.role,
      jd: titleMatch.jd,
    };
  }

  return {
    role: "No role found",
    jd: "No jd found",
  };
}
