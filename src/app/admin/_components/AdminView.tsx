import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/Badge";
import { Notice } from "@/components/Notice";
import { Icon } from "@/components/Icon";
import { StatCard } from "@/app/dashboard/_components/StatCard";
import type { AdminStats, SuspiciousSignal } from "@/server/services/stats/getAdminStats";
import styles from "./AdminView.module.css";

const KIND_TONE: Record<SuspiciousSignal["kind"], "warning" | "danger"> = {
  highEmailFailureRate: "danger",
  jsearchExhausted: "warning",
  noActiveAiProvider: "warning",
};

const KIND_LABEL: Record<SuspiciousSignal["kind"], string> = {
  highEmailFailureRate: "High email failure rate",
  jsearchExhausted: "JSearch quota exhausted",
  noActiveAiProvider: "No active AI provider",
};

export function AdminView({
  stats,
  signals,
}: {
  stats: AdminStats;
  signals: SuspiciousSignal[];
}) {
  return (
    <div className={styles.wrap}>
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Admin</h1>
          <p className={styles.subtitle}>
            System-wide health and usage. All counts read live from the database.
          </p>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <div className={styles.grid}>
          <StatCard
            icon="shield"
            label="Total users"
            value={stats.totalUsers}
            hint={stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth} this month` : undefined}
          />
          <StatCard icon="briefcase" label="Jobs in library" value={stats.totalJobs} />
          <StatCard icon="document" label="Resumes uploaded" value={stats.totalResumes} />
          <StatCard icon="target" label="Matches scored" value={stats.totalMatchesScored} />
          <StatCard icon="wand" label="Tailored resumes" value={stats.totalTailored} />
          <StatCard
            icon="check"
            label="Applications"
            value={stats.totalApplied}
            tone={stats.totalApplied > 0 ? "success" : "default"}
          />
          <StatCard
            icon="bolt"
            label="Emails sent (month)"
            value={stats.emailsSentThisMonth}
            hint={stats.emailsFailedThisMonth > 0 ? `${stats.emailsFailedThisMonth} failed` : undefined}
            tone={stats.emailsFailedThisMonth > 0 ? "warning" : "default"}
          />
          <StatCard icon="sparkles" label="Saved answers" value={stats.totalAnswers} />
        </div>
      </Reveal>

      <Reveal delay={160}>
        <Card>
          <h2 className={styles.sectionTitle}>
            <Icon name="bolt" size={18} /> Integrations
          </h2>
          <div className={styles.integrations}>
            <div className={styles.integrationRow}>
              <span className={styles.integrationLabel}>Active AI providers</span>
              <div className={styles.providerList}>
                {stats.activeAiProviders.length === 0 ? (
                  <span className={styles.muted}>None active</span>
                ) : (
                  stats.activeAiProviders.map((p) => (
                    <Badge key={p.provider} tone="success">
                      {p.provider} · {p.count}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className={styles.integrationRow}>
              <span className={styles.integrationLabel}>JSearch users</span>
              <Badge tone="neutral">{stats.usersWithJsearch} configured</Badge>
            </div>
            <div className={styles.integrationRow}>
              <span className={styles.integrationLabel}>Email accounts connected</span>
              <Badge tone="neutral">{stats.usersWithEmailConnected} active</Badge>
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={240}>
        <Card>
          <h2 className={styles.sectionTitle}>
            <Icon name="shield" size={18} /> Suspicious activity
          </h2>
          {signals.length === 0 ? (
            <Notice>Nothing flagged. All users are within normal patterns.</Notice>
          ) : (
            <ul className={styles.signals}>
              {signals.map((s, i) => (
                <li key={`${s.kind}-${s.userId}-${i}`} className={styles.signal}>
                  <Badge tone={KIND_TONE[s.kind]}>{KIND_LABEL[s.kind]}</Badge>
                  <span className={styles.signalUser}>user {s.userId.slice(-8)}</span>
                  <span className={styles.signalDetail}>{s.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
