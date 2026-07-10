import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function extractTextFromImageWithGPT(
  imageBuffer: Buffer
): Promise<string> {
  const base64Image = imageBuffer.toString("base64");

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-5-nano-2025-08-07",
    maxTokens: 4000,
  });

  const message = new HumanMessage({
    content: [
      {
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${base64Image}`,
          detail: "high",
        },
      },
      {
        type: "text",
        text: "Extract all text from this scanned document page. Return only the extracted text, no commentary, no formatting, no markdown.",
      },
    ],
  });

  const response = await model.invoke([message]);

  const text =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
      ? response.content
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("")
      : "";

  return text;
}
