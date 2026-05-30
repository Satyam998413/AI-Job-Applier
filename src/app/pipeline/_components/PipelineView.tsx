import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Reveal } from "@/components/Reveal";
import { Icon, type IconName } from "@/components/Icon";
import { Notice } from "@/components/Notice";
import type { PipelineByStatus } from "@/server/services/jobs/getPipeline";
import type { MatchStatus } from "@/types";
import { PipelineCard } from "./PipelineCard";
import styles from "./PipelineView.module.css";

const PIPELINE_ORDER: MatchStatus[] = [
  "tailored",
  "applied",
  "responded",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

const META: Record<MatchStatus, { label: string; icon: IconName; tone: "success" | "warning" | "danger" | "neutral"; hint: string }> = {
  new: { label: "New", icon: "bolt", tone: "neutral", hint: "Just scored." },
  tailored: { label: "Tailored", icon: "wand", tone: "neutral", hint: "Resume tailored — not yet applied." },
  applied: { label: "Applied", icon: "check", tone: "success", hint: "Application submitted." },
  responded: { label: "Responded", icon: "arrowRight", tone: "success", hint: "Recruiter or hiring manager replied." },
  interview: { label: "Interview", icon: "target", tone: "warning", hint: "Interview scheduled or in progress." },
  offer: { label: "Offer", icon: "sparkles", tone: "success", hint: "Offer received." },
  rejected: { label: "Rejected", icon: "shield", tone: "danger", hint: "Rejected or ghosted." },
  withdrawn: { label: "Withdrawn", icon: "shield", tone: "neutral", hint: "You withdrew the application." },
};

export function PipelineView({ pipeline }: { pipeline: PipelineByStatus }) {
  const total = PIPELINE_ORDER.reduce((sum, s) => sum + pipeline[s].length, 0);

  return (
    <div className={styles.wrap}>
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Pipeline</h1>
          <p className={styles.subtitle}>
            Track every application through the funnel: tailored → applied → response → interview → offer.
          </p>
        </header>
      </Reveal>

      {total === 0 ? (
        <Reveal delay={80}>
          <Notice>
            No applications in your pipeline yet. Move a job to "Tailored" or "Applied" on its detail page to
            start tracking outcomes.
          </Notice>
        </Reveal>
      ) : (
        <div className={styles.columns}>
          {PIPELINE_ORDER.map((s, i) => {
            const items = pipeline[s];
            const meta = META[s];
            return (
              <Reveal key={s} delay={80 + i * 60}>
                <Card>
                  <header className={styles.colHead}>
                    <h2 className={styles.colTitle}>
                      <Icon name={meta.icon} size={16} /> {meta.label}
                    </h2>
                    <Badge tone={meta.tone}>{items.length}</Badge>
                  </header>
                  {items.length === 0 ? (
                    <p className={styles.colEmpty}>{meta.hint}</p>
                  ) : (
                    <div className={styles.colList}>
                      {items.map((item) => (
                        <PipelineCard key={item.matchId} item={item} />
                      ))}
                    </div>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
