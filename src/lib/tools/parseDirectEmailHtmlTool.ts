import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { parseDirectEmailHtml } from "../directEmail/parseEmail";

export const parseDirectEmailHtmlTool = new DynamicStructuredTool({
  name: "parseDirectEmailHtml",
  description: "Parse email HTML and extract fields",
  schema: z.object({ html: z.string() }),
  func: async ({ html }) => parseDirectEmailHtml(html),
});
