import type { JDPick } from "@/types/jd";
import { JobDescription } from "../models/JobDescription";

export async function decideJD(jobTitleRaw: string): Promise<JDPick> {
  const t = (jobTitleRaw || "").toLowerCase();

  const jds = await JobDescription.find({ isActive: true });

  for (const jd of jds) {
    const matched = jd.keywords.some((keyword: string) =>
      t.includes(keyword.toLowerCase())
    );

    if (matched) {
      return {
        role: jd.role,
        jd: jd.jd,
      };
    }
  }

  const defaultJD = jds[0];

  return {
    role: defaultJD.role,
    jd: defaultJD.jd,
  };
}
