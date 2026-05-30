import { Card } from "@/components/Card";
import { ScoreRing } from "@/components/ScoreRing";
import { SkillTags } from "@/components/SkillTags";
import type { MatchDto } from "@/types";
import styles from "./MatchPanel.module.css";

export function MatchPanel({ match }: { match: MatchDto }) {
  return (
    <Card>
      <div className={styles.head}>
        <ScoreRing score={match.score ?? 0} size={80} />
        <div>
          <h2 className={styles.title}>Match score</h2>
          <p className={styles.reasoning}>{match.reasoning}</p>
        </div>
      </div>
      <div className={styles.section}>
        <h3 className={styles.label}>Matched skills</h3>
        <SkillTags skills={match.matchedSkills} tone="success" />
        {match.matchedSkills.length === 0 ? <p className={styles.none}>None</p> : null}
      </div>
      <div className={styles.section}>
        <h3 className={styles.label}>Missing skills</h3>
        <SkillTags skills={match.missingSkills} tone="warning" />
        {match.missingSkills.length === 0 ? <p className={styles.none}>None</p> : null}
      </div>
    </Card>
  );
}
