export function parseDirectEmailHtml(html: string): {
  source: string;
  emailBody: string;
  message?: string;
} {
  const source = "Direct Email";

  if (!html) {
    return { source, emailBody: "", message: "No HTML found" };
  }

  let cleaned = html;

  cleaned = cleaned.replace(
    /<div[^>]*class="[^"]*gmail_signature[^"]*"[\s\S]*?<\/div>\s*(<\/div>)*/gi,
    ""
  );

  cleaned = cleaned.replace(
    /<div[^>]*class="[^"]*gmail_attr[^"]*"[\s\S]*?<\/div>/gi,
    ""
  );

  cleaned = cleaned.replace(/<table[\s\S]*?<\/table>/gi, "");

  cleaned = cleaned.replace(/<\/p>/gi, "\n");
  cleaned = cleaned.replace(/<p[^>]*>/gi, "");

  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");

  cleaned = cleaned.replace(/<[^>]+>/g, "");

  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

   const lines = cleaned
    .split("\n")
    .map(l => l.trim())
    .filter(l => l)
    .filter(l => !l.startsWith("---------- Forwarded"))
 
  const emailBody = lines.join("\n");
  
  return {
    source,
    emailBody,
    message: "OK",
  };
}