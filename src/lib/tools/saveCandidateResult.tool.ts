import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { dbConnect } from "@/lib/db/mongoose";
import { CandidateResult } from "@/lib/models/CandidateResult";

export const saveCandidateResultTool = new DynamicStructuredTool({
  name: "saveCandidateResult",
  description: "Save candidate result to MongoDB (CandidateResult).",
  schema: z.object({
    dry: z.boolean().optional().default(false),
    source: z.string().optional().default(""),
    jobTitle: z.string().optional().default(""),
    applied_role: z.string().optional().default(""),
    emailMessageId: z.string().min(1),
    candidate_name: z.string().optional().default(""),
    candidate_email: z.string().optional().default(""),
    profile: z.any(),
    score: z.any(),
    shortlisted: z.boolean(),
  }),
  func: async ({ dry, score, candidate_name, candidate_email, ...doc }) => {
    if (dry) return { mongoId: null, skipped: true };
    await dbConnect();
    const cleanScore = { ...score };
    delete cleanScore.candidate_name;
    delete cleanScore.candidate_email;
    const created = await CandidateResult.create({
    ...doc,
    candidate_name,
    candidate_email,
    score: cleanScore,
  });
    return { mongoId: String(created._id), skipped: false };
  },
});
