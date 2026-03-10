import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

import { prefer } from "@/lib/utils/merge";

import {
  readEmailHtmlTool,
  parseIndeedEmailHtmlTool,
  decideJDTool,
  downloadAndExtractResumeTool,
  scoreCandidateTool,
  saveCandidateResultTool,
  createTrelloCardTool,
  markAsReadTool,
} from "@/lib/tools";

const InputSchema = z.object({
  gmailMessageId: z.string().min(1),
  dry: z.boolean().optional().default(false),
  test: z.boolean().optional().default(false),
  markRead: z.boolean().optional().default(false),
  origin: z.string().min(1),
});

function normalizeQuizMarks(v: any): string {
  if (v == null) return "Not Provided";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  const s = String(v).trim();
  if (!s) return "Not Provided";
  return s.replace(/%/g, "").trim() || "Not Provided";
}

export const processCandidateToolChain = RunnableSequence.from([
  async (input: unknown) => {
    const ctx = InputSchema.parse(input);
    console.log("RUNNING TOOLCHAIN ✅", ctx.gmailMessageId);
    return ctx;
    console.log("✅ TOOLCHAIN STARTED", ctx.gmailMessageId);

  },

  
  async (ctx) => {
    const { html } = await readEmailHtmlTool.invoke({ messageId: ctx.gmailMessageId, origin: ctx.origin });
    console.log("✅ readEmailHtmlTool completed")
    return { ...ctx, html };
  },


  async (ctx) => {
    const emailData = await parseIndeedEmailHtmlTool.invoke({ html: ctx.html });
    console.log("✅ parseIndeedEmailHtmlTool completed")
    return { ...ctx, emailData };
  },


  async (ctx) => {
    const jobTitle = (ctx.emailData as any).jobTitle || "Upwork Bidding Specialist";
    const resumeUrl = (ctx.emailData as any).resumeUrl || (ctx.emailData as any).saferedirectUrl;

    if (!resumeUrl) {
      console.log("⚠️ Early exit: resumeUrl not found");
      return { ...ctx, earlyExit: { skipped: true, reason: "resumeUrl not found" } };
    }

    return { ...ctx, jobTitle, resumeUrl };
  },


  async (ctx) => {
    if (ctx.earlyExit) return ctx;
    const pick = await decideJDTool.invoke({ jobTitleRaw: ctx.jobTitle });
    console.log("✅ decideJDTool completed, Decided Role: ", pick.role);
    return { ...ctx, role: pick.role, jd: pick.jd };
  },


  async (ctx) => {
    if (ctx.earlyExit) return ctx;
    const resume = await downloadAndExtractResumeTool.invoke({ resumeUrl: ctx.resumeUrl });
    console.log("✅ downloadAndExtractResumeTool completed");
    return { ...ctx, ...resume };
  },


  async (ctx) => {
    if (ctx.earlyExit) return ctx;

    const quizMarks = normalizeQuizMarks((ctx.emailData as any).quizMarks);

    const profile: any = prefer(ctx.emailData as any, {
      applied_role: ctx.jobTitle,
      resumeText: ctx.resumeText || "",
      resumeMime: ctx.resumeMime || "",
      resumeDownloadFailed: !!ctx.resumeDownloadFailed,
      resumeDownloadError: ctx.resumeDownloadError || "",
      quizMarks,
    });

    profile.age = profile.age == null ? "" : String(profile.age);
    profile.resumeText = profile.resumeText ? String(profile.resumeText) : "";
    console.log("✅ Profile prepared");
    return { ...ctx, quizMarks, profile };
  },


  async (ctx) => {
    if (ctx.earlyExit) return ctx;

    let score: any = { match_score: 0, candidate_name: "Not Provided", title: "" };
    let shortlisted = false;

    try {
      score = await scoreCandidateTool.invoke({ jd: ctx.jd, role: ctx.role, profile: ctx.profile });
      shortlisted = Number(score?.match_score || 0) >= 60;
      console.log("✅ scoreCandidateTool completed, Score: ", score.match_score);
    } catch (e: any) {
      console.log("❌ scoreCandidateTool failed (continuing):", e?.message || e);
      score = { match_score: 0, candidate_name: "Not Provided", title: "", error: e?.message || "score failed" };
      shortlisted = false;
    }

    return { ...ctx, score, shortlisted };
  },


  async (ctx) => {
    if (ctx.earlyExit) return ctx;

    const saved = await saveCandidateResultTool.invoke({
      dry: ctx.dry,
      emailMessageId: ctx.gmailMessageId,
      source: ctx.profile.source || "",
      jobTitle: ctx.jobTitle,
      applied_role: ctx.role,
      candidate_name: ctx.score?.candidate_name || "",
      candidate_email: ctx.score?.candidate_email || "",
      profile: ctx.profile,
      score: ctx.score,
      shortlisted: ctx.shortlisted,
    });

    return { ...ctx, mongoId: saved.mongoId };
  },

  async (ctx) => {
    if (ctx.earlyExit) return ctx;

    if (ctx.shortlisted && !ctx.dry && !ctx.resumeDownloadFailed) {
      const trelloName =
        ctx.score.title ||
        `${ctx.score.candidate_name || "Not Provided"} - ${ctx.role} - ${ctx.profile.source || "Indeed"}`;

      await createTrelloCardTool.invoke({ name: trelloName, role: ctx.role, quizMarks: ctx.quizMarks, score: ctx.score, profile: ctx.profile });
       console.log("✅ createTrelloCardTool completed");
    }

    return ctx;
  },

  async (ctx) => {
    if (ctx.earlyExit) return ctx;

    if (ctx.markRead) {
      try {
        await markAsReadTool.invoke({ messageId: ctx.gmailMessageId, origin: ctx.origin});
        console.log("✅ markAsReadTool completed");
      } catch (e: any) {
        console.log("markRead failed (ignored):", e?.message || e);
      }
    }

    return ctx;
  },

  async (ctx) => {
    if (ctx.earlyExit) return { messageId: ctx.gmailMessageId, ...ctx.earlyExit };

    return {
      messageId: ctx.gmailMessageId,
      ok: true,
      shortlisted: ctx.shortlisted,
      mongoId: ctx.mongoId,
      quizMarks: ctx.quizMarks,
      match_score: Number(ctx.score?.match_score || 0),
      resumeDownloadFailed: !!ctx.resumeDownloadFailed,
      resumeDownloadError: ctx.resumeDownloadError || "",
    };
  },
]);
