export function extractSalaryQA(html: string): {
  question: string;
  answer: string;
} {
  if (!html) {
    return { question: "", answer: "" };
  }

  const questionRegex = /<p[^>]*>([^<]*salary[^<]*)<\/p>/i;

  const questionMatch = html.match(questionRegex);

  if (!questionMatch) {
    return { question: "", answer: "" };
  }

  const extractedQuestion = questionMatch[1].trim();

  const remainingHtml = html.slice(questionMatch.index!);

  const answerRegex = /border-left:[^>]*>\s*<p[^>]*>(.*?)<\/p>/i;

  const answerMatch = remainingHtml.match(answerRegex);

  const extractedAnswer = answerMatch
    ? answerMatch[1].replace(/<[^>]+>/g, "").trim()
    : "";

  return {
    question: extractedQuestion || "",
    answer: extractedAnswer || "",
  };
}

export function decodeHtmlUrl(u: string) {
  let out = u.replace(/&amp;/g, "&");
  try {
    out = decodeURIComponent(out);
  } catch {}
  return out;
}

export function prefer<A extends Record<string, any>>(a: A, b: A): A {
  const out: any = { ...a };
  for (const k of Object.keys(b)) {
    const v = (b as any)[k];
    const ok =
      v !== undefined &&
      v !== null &&
      !(typeof v === "string" && v.trim() === "");
    if (ok) out[k] = v;
  }
  return out;
}
