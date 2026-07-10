import { extractResumeTextFromBuffer } from "@/lib/extract/resumeText";

export async function downloadAndExtractFirebaseResume(resumeUrl: string) {
  const res = await fetch(resumeUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/pdf,*/*",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Firebase resume download failed: ${res.status} ${res.statusText}`
    );
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "application/pdf";
  const finalUrl = res.url;

  const guessedFilename = mime.includes("pdf")
    ? "resume.pdf"
    : mime.includes("wordprocessingml")
    ? "resume.docx"
    : "resume.pdf";

  const resumeText = await extractResumeTextFromBuffer(
    buf,
    mime,
    guessedFilename
  );

  return { resumeText, resumeMime: mime, finalUrl };
}
