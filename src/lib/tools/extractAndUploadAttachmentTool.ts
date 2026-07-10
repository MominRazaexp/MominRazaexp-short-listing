import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { extractAndUploadAttachment } from "../directEmail/extractAndUploadAttachment";

export const extractAndUploadAttachmentTool = new DynamicStructuredTool({
  name: "extractAndUploadAttachment",
  description: "Extracts resume text from email attachment and uploads it to Cloudinary",
  schema: z.object({
    attachments: z.array(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
        data: z.string(),
        partId: z.string().optional(),
        attachmentId: z.string().optional(),
      })
    ),
    gmailMessageId: z.string(),
    origin: z.string()
  }),
  func: async ({ attachments, gmailMessageId, origin }) => extractAndUploadAttachment(attachments, gmailMessageId, origin),
});