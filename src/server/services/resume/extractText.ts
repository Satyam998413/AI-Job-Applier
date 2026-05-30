/**
 * Extract raw text from an uploaded resume. Supports PDF, DOCX, TXT, MD, HTML, RTF.
 * Legacy .doc (Word 97–2003) is NOT supported — convert to .docx first.
 * Dynamic imports keep Node-only libs out of the client bundle.
 */
export async function extractText(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const name = fileName.toLowerCase();
  const isPdf = mimeType === "application/pdf" || name.endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx");
  const isLegacyDoc = mimeType === "application/msword" || name.endsWith(".doc");
  const isTxt = mimeType === "text/plain" || name.endsWith(".txt");
  const isMd = mimeType === "text/markdown" || name.endsWith(".md") || name.endsWith(".markdown");
  const isHtml = mimeType === "text/html" || name.endsWith(".html") || name.endsWith(".htm");
  const isRtf = mimeType === "application/rtf" || mimeType === "text/rtf" || name.endsWith(".rtf");

  if (isPdf) {
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = (mod.default ?? mod) as (b: Buffer) => Promise<{ text: string }>;
    const { text } = await pdfParse(buffer);
    return text.trim();
  }

  if (isDocx) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
  }

  if (isTxt || isMd) {
    return buffer.toString("utf8").trim();
  }

  if (isHtml) {
    return stripHtml(buffer.toString("utf8")).trim();
  }

  if (isRtf) {
    return stripRtf(buffer.toString("utf8")).trim();
  }

  if (isLegacyDoc) {
    throw new Error(
      "Legacy .doc files (Word 97–2003) are not supported. Please save as .docx or PDF and re-upload.",
    );
  }

  throw new Error(
    "Unsupported file type. Supported: PDF, DOCX, TXT, MD, HTML, RTF.",
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * Pragmatic RTF extractor. Resumes rarely come in RTF; for the few that do,
 * stripping control words / groups gives recognizable text. Loses formatting,
 * which is fine — we hand the result to the LLM regardless.
 */
function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\par[d]?\b/g, "\n")
    .replace(/\{\*?\\[^{}]+\}/g, "")
    .replace(/\\'([0-9a-fA-F]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\[a-z]+(-?\d+)?[ ]?/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}
