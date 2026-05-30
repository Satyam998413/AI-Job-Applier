import { Job } from "@/server/models/Job";
import { normalizeForDedup } from "./normalize";
import { seedJobProvider, type JobProvider, type JobQuery, type RawJob } from "./jobProvider";

/**
 * Pull jobs from a provider and persist them. Same role across two providers is
 * stored as ONE record, with the (source, externalId) pairs accumulated in `sources`.
 *
 * Lookup precedence:
 *   1. {normalizedTitle, normalizedCompany} — semantic match (e.g. "Sr. FE Eng" @ "Acme, Inc." vs "Senior Frontend Engineer" @ "Acme Inc")
 *   2. {externalId} — same provider re-ingesting a re-titled posting
 *   3. Insert new
 *
 * Returns how many raw jobs the provider produced (not how many distinct DB rows resulted).
 */
export async function ingestJobs(
  provider: JobProvider = seedJobProvider,
  query?: JobQuery,
): Promise<number> {
  const rawJobs = await provider.fetchJobs(query);

  await Promise.all(rawJobs.map((raw) => upsertJob(raw, provider.source)));

  return rawJobs.length;
}

async function upsertJob(raw: RawJob, providerSource: string): Promise<void> {
  const normalizedTitle = normalizeForDedup(raw.title);
  const normalizedCompany = normalizeForDedup(raw.company);

  const existing = await Job.findOne({
    $or: [
      { normalizedTitle, normalizedCompany },
      ...(raw.externalId ? [{ externalId: raw.externalId }] : []),
    ],
  });

  const fields = {
    title: raw.title,
    company: raw.company,
    normalizedTitle,
    normalizedCompany,
    location: raw.location,
    description: raw.description,
    url: raw.url,
    tags: raw.tags,
    source: providerSource,
    salaryMin: raw.salaryMin ?? null,
    salaryMax: raw.salaryMax ?? null,
    salaryCurrency: raw.salaryCurrency ?? null,
    employmentType: raw.employmentType ?? null,
    isRemote: raw.isRemote ?? null,
    experienceLevel: raw.experienceLevel ?? null,
    ...(raw.externalId ? { externalId: raw.externalId } : {}),
  };

  if (!existing) {
    await Job.create({
      ...fields,
      postedAt: new Date(),
      sources: [{ source: providerSource, externalId: raw.externalId ?? null }],
    });
    return;
  }

  const alreadyRecorded = existing.sources.some(
    (s) => s.source === providerSource && (s.externalId ?? null) === (raw.externalId ?? null),
  );

  await Job.updateOne(
    { _id: existing._id },
    {
      $set: fields,
      ...(alreadyRecorded
        ? {}
        : { $push: { sources: { source: providerSource, externalId: raw.externalId ?? null } } }),
    },
  );
}
