import { Reveal } from "@/components/Reveal";
import { FeatureCard } from "./FeatureCard";
import type { IconName } from "@/components/Icon";
import styles from "./FeatureSection.module.css";

type Feature = {
  icon: IconName;
  title: string;
  body: string;
  accent: "primary" | "violet" | "cyan" | "success" | "warning" | "danger";
  tag: string;
};

const features: Feature[] = [
  {
    icon: "document",
    title: "Resume intelligence",
    body: "Drop in a PDF or DOCX. Our AI reads it like a senior recruiter — mapping your real skills, summary, seniority, and the achievements worth amplifying.",
    accent: "primary",
    tag: "Parsing",
  },
  {
    icon: "target",
    title: "Precision matching",
    body: "Every role gets a 0–100 fit score against your profile. See exactly which skills you match, the gaps worth closing, and which roles to skip entirely.",
    accent: "violet",
    tag: "Scoring",
  },
  {
    icon: "wand",
    title: "ATS-ready rewrites",
    body: "Generate keyword-optimized resumes for any job in seconds. Reframed from your real experience — never fabricated, always recruiter-tested.",
    accent: "cyan",
    tag: "Tailoring",
  },
  {
    icon: "bolt",
    title: "Smart cover letters",
    body: "One click drafts a personalised cover letter that opens with the hook hiring managers actually read — and skips the AI-sounding fluff.",
    accent: "warning",
    tag: "Writing",
  },
  {
    icon: "shield",
    title: "Privacy-first by design",
    body: "Your resume never trains a model. Data is encrypted in transit and at rest, with single-click deletion across every saved artifact.",
    accent: "success",
    tag: "Security",
  },
  {
    icon: "briefcase",
    title: "One pipeline, every role",
    body: "Track every application from applied → screen → offer in a Kanban board built for job hunting, not project management.",
    accent: "danger",
    tag: "Tracking",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>What you get</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          Every step of the hunt, <span className={styles.headingAccent}>handled.</span>
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p className={styles.lede}>
          One tool that replaces resume builders, job boards, ATS optimizers, and a stack of
          half-finished Google docs.
        </p>
      </Reveal>
      <div className={styles.grid}>
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <FeatureCard {...f} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
