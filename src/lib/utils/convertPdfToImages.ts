import "pdf-parse/worker";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export async function convertPdfToImages(buf: Buffer): Promise<Buffer[]> {
  const parser = new PDFParse({
    data: new Uint8Array(buf),
    CanvasFactory,
  });

  const result = await parser.getScreenshot({
    scale: 2.0,
    imageBuffer: true,
    imageDataUrl: false,
  });

  await parser.destroy();

  const images: Buffer[] = [];

  for (const page of result.pages) {
    if (page.data) {
      images.push(Buffer.from(page.data));
    }
  }

  return images;
}
