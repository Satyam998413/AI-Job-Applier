import Link from "next/link";
import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Icon, type IconName } from "@/components/Icon";
import type { UserStats } from "@/server/services/stats/getUserStats";
import type { ActivityEvent } from "@/server/services/stats/getUserActivity";
import { StatsGrid } from "./StatsGrid";
import { ActivityFeed } from "./ActivityFeed";
import styles from "./DashboardView.module.css";

const steps: { href: string; icon: IconName; step: string; title: string; body: string }[] = [
  {
    href: "/resume",
    icon: "upload",
    step: "Step 1",
    title: "Upload your resume",
    body: "We extract your skills, summary, and experience with AI.",
  },
  {
    href: "/jobs",
    icon: "target",
    step: "Step 2",
    title: "Browse & match jobs",
    body: "See how every role scores against your profile.",
  },
  {
    href: "/email",
    icon: "wand",
    step: "Step 3",
    title: "Tailor & reach out",
    body: "Generate ATS-friendly resumes and outreach emails per job.",
  },
];

export function DashboardView({
  fullName,
  stats,
  activity,
}: {
  fullName: string;
  stats: UserStats;
  activity: ActivityEvent[];
}) {
  return (
    <div className={styles.wrap}>
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Welcome back, <span className={styles.name}>{fullName.split(" ")[0]}</span>
          </h1>
          <p className={styles.subtitle}>Here&apos;s the state of your job hunt.</p>
        </header>
      </Reveal>
      <Reveal delay={80}>
        <StatsGrid stats={stats} />
      </Reveal>
      <Reveal delay={160}>
        <ActivityFeed events={activity} />
      </Reveal>
      <Reveal delay={240}>
        <h2 className={styles.sectionTitle}>Get the most out of AI Job Applier</h2>
      </Reveal>
      <div className={styles.grid}>
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={280 + i * 80}>
            <Link href={s.href} className={styles.cardLink}>
              <Card className={styles.card}>
                <span className={styles.icon}>
                  <Icon name={s.icon} size={22} />
                </span>
                <span className={styles.step}>{s.step}</span>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardBody}>{s.body}</p>
                <span className={styles.go}>
                  Open <Icon name="arrowRight" size={16} />
                </span>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
