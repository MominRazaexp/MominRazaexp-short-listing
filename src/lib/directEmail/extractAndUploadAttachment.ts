import { extractResumeTextFromBuffer } from "@/lib/extract/resumeText";

type Attachment = {
  filename: string;
  mimeType: string;
  data: string;
  partId?: string;
  attachmentId?: string; 
};

export async function extractAndUploadAttachment(attachments: Attachment[], gmailMessageId: string, origin: string) {
  const resumeAttachment = attachments.find((a) =>
    a.mimeType.includes("pdf") ||
    a.mimeType.includes("wordprocessingml") ||
    a.mimeType.includes("text/plain") ||
    a.mimeType.startsWith("image/")
  );

  if (!resumeAttachment) {
    throw new Error("No valid resume attachment found (pdf/docx/txt)");
  }

  const buf = Buffer.from(resumeAttachment.data, "base64");

  const resumeText = await extractResumeTextFromBuffer(
    buf,
    resumeAttachment.mimeType,
    resumeAttachment.filename
  );

    const attachmentId = resumeAttachment.attachmentId!;
    const mime = encodeURIComponent(resumeAttachment.mimeType);
    const filename = encodeURIComponent(resumeAttachment.filename);
    const resumeUrl = `${origin}/api/attachment?messageId=${gmailMessageId}&attachmentId=${encodeURIComponent(attachmentId)}&mime=${mime}&filename=${filename}`;


  return {
    resumeText,
    resumeMime: resumeAttachment.mimeType,
    resumeUrl,
    finalUrl: resumeUrl,
  };
}