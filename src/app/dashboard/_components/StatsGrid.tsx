import type { UserStats } from "@/server/services/stats/getUserStats";
import { StatCard } from "./StatCard";
import styles from "./StatsGrid.module.css";

const PROVIDER_LABEL: Record<string, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
  claude: "Claude",
  groq: "Groq",
  ollama: "Ollama",
  "env-gemini": "Gemini (env)",
};

export function StatsGrid({ stats }: { stats: UserStats }) {
  const aiLabel = stats.activeAiProvider ? PROVIDER_LABEL[stats.activeAiProvider] ?? stats.activeAiProvider : "Not set";

  return (
    <div className={styles.grid}>
      <StatCard icon="target" label="Jobs scored" value={stats.matchesScored} />
      <StatCard icon="wand" label="Tailored resumes" value={stats.tailoredResumes} />
      <StatCard
        icon="check"
        label="Applied"
        value={stats.applied}
        tone={stats.applied > 0 ? "success" : "default"}
      />
      <StatCard
        icon="bolt"
        label="Emails sent (this month)"
        value={stats.emailsSentThisMonth}
        hint={stats.emailsFailedThisMonth > 0 ? `${stats.emailsFailedThisMonth} failed` : undefined}
        tone={stats.emailsFailedThisMonth > 0 ? "warning" : "default"}
      />
      <StatCard icon="document" label="Saved answers" value={stats.answersSaved} />
      <StatCard
        icon="sparkles"
        label="Active AI"
        value={aiLabel}
        tone={stats.activeAiProvider ? "default" : "warning"}
      />
      <StatCard icon="briefcase" label="Jobs in library" value={stats.jobsInDb} />
      <StatCard
        icon="shield"
        label="JSearch quota"
        value={`${stats.jsearch.usedThisMonth} / ${stats.jsearch.totalLimit}`}
        hint={stats.jsearch.configured ? `${stats.jsearch.remaining} remaining` : "Not configured"}
        tone={!stats.jsearch.configured ? "warning" : stats.jsearch.remaining === 0 ? "danger" : "default"}
      />
    </div>
  );
}
