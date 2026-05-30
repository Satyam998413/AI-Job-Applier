import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { JobCard, type JobListItem } from "./JobCard";
import styles from "./JobsList.module.css";

export function JobsList({ jobs }: { jobs: JobListItem[] }) {
  if (jobs.length === 0) {
    return (
      <Reveal variant="scale">
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Icon name="briefcase" size={28} />
          </span>
          <p className={styles.emptyTitle}>No jobs yet</p>
          <p className={styles.emptyBody}>Load a set of sample roles to start scoring matches.</p>
        </div>
      </Reveal>
    );
  }
  return (
    <div className={styles.list}>
      {jobs.map((job, i) => (
        <Reveal key={job.id} delay={Math.min(i * 60, 360)}>
          <JobCard job={job} />
        </Reveal>
      ))}
    </div>
  );
}
