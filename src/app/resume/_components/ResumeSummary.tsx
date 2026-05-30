import { Card } from "@/components/Card";
import { SkillTags } from "@/components/SkillTags";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";
import type { ResumeDto } from "@/types";
import styles from "./ResumeSummary.module.css";

export function ResumeSummary({ resume }: { resume: ResumeDto }) {
  return (
    <Card>
      <div className={styles.head}>
        <span className={styles.icon}>
          <Icon name="document" size={22} />
        </span>
        <div className={styles.headText}>
          <h2 className={styles.fileName}>{resume.fileName}</h2>
          <div className={styles.meta}>
            <Badge tone="success">
              <Icon name="check" size={13} /> Analyzed
            </Badge>
            <span>{resume.experienceYears} yrs experience</span>
            <span>·</span>
            <span>{resume.skills.length} skills</span>
            {resume.fileUrl ? (
              <>
                <span>·</span>
                <a href={resume.fileUrl} target="_blank" rel="noreferrer">View original</a>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <p className={styles.summary}>{resume.summary}</p>
      <h3 className={styles.label}>Extracted skills</h3>
      <SkillTags skills={resume.skills} tone="success" />
    </Card>
  );
}
