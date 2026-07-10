import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { parseLushformEmailHtml } from "../lushformEmail/parseEmail";

export const parseLushformEmailHtmlTool = new DynamicStructuredTool({
  name: "parseLushformEmailHtml",
  description:
    "Parse Lushform email HTML and extract fields like resumeUrl, jobTitle, etc.",
  schema: z.object({ html: z.string() }),
  func: async ({ html }) => parseLushformEmailHtml(html),
});
