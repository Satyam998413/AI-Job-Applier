// pdf-parse's package index runs debug code on import, so we import its lib entry
// directly (see services/resume/extractText.ts). That subpath ships no types.
declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfParseResult = { text: string; numpages: number; info: unknown };
  const pdfParse: (dataBuffer: Buffer) => Promise<PdfParseResult>;
  export default pdfParse;
}
