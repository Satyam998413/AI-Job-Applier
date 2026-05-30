import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Applier — Apply smarter, land more interviews",
  description:
    "Upload your resume once. AI extracts your strengths, scores every job, and rewrites your resume to beat the ATS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
