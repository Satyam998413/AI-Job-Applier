"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import styles from "./JobFilters.module.css";

type FormState = {
  q: string;
  location: string;
  mode: string;
  salaryMin: string;
  experienceLevel: string;
  employmentType: string;
  datePosted: string;
  sort: string;
};

const EMPTY: FormState = {
  q: "",
  location: "",
  mode: "",
  salaryMin: "",
  experienceLevel: "",
  employmentType: "",
  datePosted: "",
  sort: "latest",
};

function fromUrl(sp: URLSearchParams): FormState {
  return {
    q: sp.get("q") ?? "",
    location: sp.get("location") ?? "",
    mode: sp.get("mode") ?? "",
    salaryMin: sp.get("salaryMin") ?? "",
    experienceLevel: sp.get("experienceLevel") ?? "",
    employmentType: sp.get("employmentType") ?? "",
    datePosted: sp.get("datePosted") ?? "",
    sort: sp.get("sort") ?? "latest",
  };
}

function toQuery(s: FormState): string {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set("q", s.q.trim());
  if (s.location.trim()) p.set("location", s.location.trim());
  if (s.mode) p.set("mode", s.mode);
  if (s.salaryMin) p.set("salaryMin", s.salaryMin);
  if (s.experienceLevel) p.set("experienceLevel", s.experienceLevel);
  if (s.employmentType.trim()) p.set("employmentType", s.employmentType.trim());
  if (s.datePosted) p.set("datePosted", s.datePosted);
  if (s.sort && s.sort !== "latest") p.set("sort", s.sort);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

const DEBOUNCE_MS = 350;

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = useMemo(() => fromUrl(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [state, setState] = useState<FormState>(initial);

  // Push debounced URL updates whenever state changes.
  useEffect(() => {
    const target = `${pathname}${toQuery(state)}`;
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (target === current) return;
    const t = setTimeout(() => router.push(target), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function reset() {
    setState(EMPTY);
    router.push(pathname);
  }

  return (
    <Card>
      <header className={styles.head}>
        <h2 className={styles.title}>
          <Icon name="target" size={16} /> Filter &amp; sort
        </h2>
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
      </header>
      <div className={styles.grid}>
        <Input
          id="q"
          label="Keywords"
          placeholder="React, Node…"
          value={state.q}
          onChange={(e) => set("q", e.target.value)}
        />
        <Input
          id="location"
          label="Location"
          placeholder="Remote, London…"
          value={state.location}
          onChange={(e) => set("location", e.target.value)}
        />
        <div className={styles.field}>
          <label htmlFor="mode" className={styles.label}>Mode</label>
          <select
            id="mode"
            className={styles.select}
            value={state.mode}
            onChange={(e) => set("mode", e.target.value)}
          >
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
        <Input
          id="salaryMin"
          label="Min salary (USD)"
          type="number"
          placeholder="e.g. 80000"
          value={state.salaryMin}
          onChange={(e) => set("salaryMin", e.target.value)}
        />
        <div className={styles.field}>
          <label htmlFor="experienceLevel" className={styles.label}>Experience</label>
          <select
            id="experienceLevel"
            className={styles.select}
            value={state.experienceLevel}
            onChange={(e) => set("experienceLevel", e.target.value)}
          >
            <option value="">Any</option>
            <option value="intern">Intern</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="employmentType" className={styles.label}>Employment</label>
          <select
            id="employmentType"
            className={styles.select}
            value={state.employmentType}
            onChange={(e) => set("employmentType", e.target.value)}
          >
            <option value="">Any</option>
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="contractor">Contract</option>
            <option value="intern">Internship</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="datePosted" className={styles.label}>Date posted</label>
          <select
            id="datePosted"
            className={styles.select}
            value={state.datePosted}
            onChange={(e) => set("datePosted", e.target.value)}
          >
            <option value="">Any time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="sort" className={styles.label}>Sort by</label>
          <select
            id="sort"
            className={styles.select}
            value={state.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="bestMatch">Best match</option>
            <option value="highestSalary">Highest salary</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
