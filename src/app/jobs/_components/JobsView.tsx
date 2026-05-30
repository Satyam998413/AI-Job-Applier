import { Reveal } from "@/components/Reveal";
import { JobsHeader } from "./JobsHeader";
import { JobsList } from "./JobsList";
import { JobFilters } from "./JobFilters";
import type { JobListItem } from "./JobCard";
import styles from "./JobsView.module.css";

export function JobsView({ jobs, hasResume }: { jobs: JobListItem[]; hasResume: boolean }) {
  return (
    <div className={styles.wrap}>
      <Reveal>
        <JobsHeader hasResume={hasResume} />
      </Reveal>
      <Reveal delay={60}>
        <JobFilters />
      </Reveal>
      <JobsList jobs={jobs} />
    </div>
  );
}
