import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(): Promise<Response> {
  const filePath = join(process.cwd(), "public", "index.html");

  const html = await readFile(filePath, "utf-8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}