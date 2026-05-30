/**
 * A job source. Ships a seeded provider plus a live JSearch provider; both implement the
 * same interface, so callers (ingestJobs) never change when sources are swapped.
 */
export type RawJob = {
  /** Stable provider id (e.g. JSearch job_id) for dedup. Absent for seed jobs. */
  externalId?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  tags: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  isRemote?: boolean;
  experienceLevel?: ExperienceLevel;
};

export type ExperienceLevel = "intern" | "entry" | "mid" | "senior" | "lead";

/** Search parameters. Seed provider ignores these; live providers use them. */
export type JobQuery = {
  role: string;
  location?: string;
  remoteOnly?: boolean;
};

export interface JobProvider {
  readonly source: string;
  fetchJobs(query?: JobQuery): Promise<RawJob[]>;
}

const seedJobs: RawJob[] = [
  {
    title: "Senior Frontend Engineer",
    company: "Northwind Labs",
    location: "Remote",
    description:
      "Build performant web apps with React, Next.js, and TypeScript. You will own UI architecture, " +
      "design systems, and collaborate with designers. Experience with CSS modules, accessibility, and " +
      "testing (Jest/Playwright) required.",
    url: "https://example.com/jobs/northwind-frontend",
    tags: ["React", "Next.js", "TypeScript", "CSS"],
  },
  {
    title: "Full Stack Developer",
    company: "Brightwave",
    location: "Remote (US)",
    description:
      "Work across the stack with Node.js, Express, MongoDB, and React. Design REST APIs, model data, " +
      "and ship features end to end. Familiarity with Mongoose and cloud deployment is a plus.",
    url: "https://example.com/jobs/brightwave-fullstack",
    tags: ["Node.js", "MongoDB", "React", "Express"],
  },
  {
    title: "Backend Engineer (Node.js)",
    company: "Cobalt Systems",
    location: "Berlin / Remote",
    description:
      "Design and scale backend services in Node.js and TypeScript. Strong knowledge of PostgreSQL, " +
      "Redis, queues, and API design. You will improve reliability, observability, and performance.",
    url: "https://example.com/jobs/cobalt-backend",
    tags: ["Node.js", "TypeScript", "PostgreSQL", "Redis"],
  },
  {
    title: "AI Engineer",
    company: "Lumen AI",
    location: "Remote",
    description:
      "Build LLM-powered features: prompt engineering, retrieval, and structured output pipelines. " +
      "Python or TypeScript, experience integrating model APIs, and evaluation/testing of AI systems.",
    url: "https://example.com/jobs/lumen-ai-engineer",
    tags: ["LLM", "Python", "TypeScript", "Prompt Engineering"],
  },
  {
    title: "DevOps Engineer",
    company: "Stratus Cloud",
    location: "Remote (EU)",
    description:
      "Own CI/CD, Docker, Kubernetes, and infrastructure-as-code (Terraform). Improve deployment " +
      "pipelines and monitoring. AWS experience and scripting in Bash/Python required.",
    url: "https://example.com/jobs/stratus-devops",
    tags: ["Docker", "Kubernetes", "Terraform", "AWS"],
  },
  {
    title: "Product Designer",
    company: "Foundry Studio",
    location: "Remote",
    description:
      "Design end-to-end product experiences. Strong skills in Figma, design systems, prototyping, and " +
      "user research. Collaborate closely with engineering to ship polished interfaces.",
    url: "https://example.com/jobs/foundry-designer",
    tags: ["Figma", "Design Systems", "UX Research"],
  },
];

/** Default seeded provider used by the MVP. */
export const seedJobProvider: JobProvider = {
  source: "seed",
  async fetchJobs() {
    return seedJobs;
  },
};
