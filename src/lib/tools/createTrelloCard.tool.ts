import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createTrelloCard } from "@/lib/integrations/trello";

export const createTrelloCardTool = new DynamicStructuredTool({
  name: "createTrelloCard",
  description: "Create a Trello card using name + desc.",
  schema: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    quizMarks: z.string().min(1),
    score: z.any().optional(),
    profile: z.any().optional(),
  }),
  func: async ({ name, role, quizMarks, score, profile }) => {
    await createTrelloCard({ name, role, quizMarks, score, profile });
    return { ok: true };
  },
});
