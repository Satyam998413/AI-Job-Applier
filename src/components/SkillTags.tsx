import { Badge } from "./Badge";
import styles from "./SkillTags.module.css";

type Tone = "neutral" | "success" | "warning" | "danger";

export function SkillTags({ skills, tone = "neutral" }: { skills: string[]; tone?: Tone }) {
  if (skills.length === 0) return null;
  return (
    <div className={styles.tags}>
      {skills.map((skill) => (
        <Badge key={skill} tone={tone}>
          {skill}
        </Badge>
      ))}
    </div>
  );
}
