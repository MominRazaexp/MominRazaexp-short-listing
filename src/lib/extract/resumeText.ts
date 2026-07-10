import "pdf-parse/worker";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";
import { isGarbageText } from "../utils/utils";
import { convertPdfToImages } from "../utils/convertPdfToImages";
import { extractTextFromImageWithGPT } from "../utils/extractTextFromImageWithGPT";

export async function extractResumeTextFromBuffer(
  buf: Buffer,
  mime?: string,
  filename?: string
) {
  const name = (filename || "").toLowerCase();
  const type = (mime || "").toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    let text = "";

    try {
      const parser = new PDFParse({
        data: new Uint8Array(buf),
        CanvasFactory,
      });
      const result = await parser.getText();
      await parser.destroy();

      text = (result.text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200_000);
    } catch (e: any) {
      console.log("PDF text parse failed:", e?.message || e);
    }

    if (isGarbageText(text)) {
      console.log("Using GPT-5-nano for text extraction...");

      const imageBuffers = await convertPdfToImages(buf);

      if (imageBuffers.length === 0) {
        throw new Error("PDF to image conversion returned 0 images");
      }

      const pageTexts: string[] = [];

      for (let i = 0; i < imageBuffers.length; i++) {
        const pageText = await extractTextFromImageWithGPT(imageBuffers[i]);
        pageTexts.push(pageText);
      }

      const ocrText = pageTexts
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200_000);

      if (!ocrText) {
        throw new Error("GPT-5-nano returned empty text");
      }

      return ocrText;
    }
    return text;
  }

  if (type.startsWith("image/")) {
    console.log("Using GPT-5-nano for image text extraction...");
    
    const imageText = await extractTextFromImageWithGPT(buf);
    
    const cleanedText = (imageText || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200_000);
    
    if (!cleanedText) {
      throw new Error("GPT-5-nano returned empty text");
    }
    
    return cleanedText;
  }

  if (type.includes("wordprocessingml.document") || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return (result.value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200_000);
  }

  if (type.includes("text/plain") || name.endsWith(".txt")) {
    return buf.toString("utf8").slice(0, 200_000);
  }

  if (type.includes("text/html") || name.endsWith(".html")) {
    const html = buf.toString("utf8");
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200_000);
  }

  throw new Error(`Unsupported resume type: ${type || "unknown"}`);
}
