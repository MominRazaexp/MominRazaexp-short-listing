import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { downloadAndExtractFirebaseResume } from "../lushformEmail/downloadAndExtractFirebaseResume";

export const downloadAndExtractFirebaseResumeTool = new DynamicStructuredTool({
  name: "downloadAndExtractFirebaseResume",
  description:
    "Download resume from Firebase Storage URL and extract plain text.",
  schema: z.object({ resumeUrl: z.string().min(5) }),
  func: async ({ resumeUrl }) => {
    try {
      const out = await downloadAndExtractFirebaseResume(resumeUrl);
      return { ...out, resumeDownloadFailed: false, resumeDownloadError: "" };
    } catch (e: any) {
      return {
        resumeText: "",
        resumeMime: "",
        finalUrl: resumeUrl,
        resumeDownloadFailed: true,
        resumeDownloadError: e?.message || String(e),
      };
    }
  },
});
