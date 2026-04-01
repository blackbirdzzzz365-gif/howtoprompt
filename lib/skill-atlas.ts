import { promises as fs } from "node:fs";
import path from "node:path";

export type SkillReferenceDoc = {
  id: string;
  label: string;
  path: string;
  exists: boolean;
  kind: string;
  title: string;
  excerpt: string;
  raw: string | null;
  rawTruncated: boolean;
  size: number | null;
};

export type SkillSection = {
  title: string;
  body: string;
};

export type SkillAtlasSkill = {
  slug: string;
  name: string;
  canonicalName: string;
  heading: string;
  description: string;
  sourceKind: string;
  sourceLabel: string;
  sourcePath: string;
  allSourcePaths: string[];
  directory: string;
  category: string;
  isAlias: boolean;
  summaryVi: string;
  triggerPhrases: string[];
  workflowHighlights: string[];
  guardrails: string[];
  referencedDocs: SkillReferenceDoc[];
  raw: string;
  rawBytes: number;
  sections: SkillSection[];
  relatedSkillNames: string[];
  relatedSkillSlugs: string[];
  sourcePriority: number;
  searchText: string;
  advisorContext: string;
};

export type SkillAtlasDb = {
  generatedAt: string;
  sourceRoots: Array<{
    id: string;
    label: string;
    kind: string;
    root: string;
    priority: number;
  }>;
  stats: {
    skillCount: number;
    referenceCount: number;
    rawByteCount: number;
  };
  skills: SkillAtlasSkill[];
};

export type SkillAtlasListItem = Omit<SkillAtlasSkill, "raw" | "referencedDocs" | "searchText" | "advisorContext"> & {
  referencedDocCount: number;
};

const atlasPath = path.join(process.cwd(), "data", "skill-atlas.generated.json");

let cachedAtlas: SkillAtlasDb | null = null;

export async function getSkillAtlas() {
  if (cachedAtlas) {
    return cachedAtlas;
  }

  const raw = await fs.readFile(atlasPath, "utf8");
  cachedAtlas = JSON.parse(raw) as SkillAtlasDb;
  return cachedAtlas;
}

export async function getSkillAtlasList() {
  const atlas = await getSkillAtlas();
  return atlas.skills.map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    canonicalName: skill.canonicalName,
    heading: skill.heading,
    description: skill.description,
    sourceKind: skill.sourceKind,
    sourceLabel: skill.sourceLabel,
    sourcePath: skill.sourcePath,
    allSourcePaths: skill.allSourcePaths,
    directory: skill.directory,
    category: skill.category,
    isAlias: skill.isAlias,
    summaryVi: skill.summaryVi,
    triggerPhrases: skill.triggerPhrases,
    workflowHighlights: skill.workflowHighlights,
    guardrails: skill.guardrails,
    rawBytes: skill.rawBytes,
    sections: skill.sections,
    relatedSkillNames: skill.relatedSkillNames,
    relatedSkillSlugs: skill.relatedSkillSlugs,
    sourcePriority: skill.sourcePriority,
    referencedDocCount: skill.referencedDocs.length,
  }));
}

export async function getSkillBySlug(slug: string) {
  const atlas = await getSkillAtlas();
  return atlas.skills.find((skill) => skill.slug === slug) ?? null;
}

export async function getSkillReferenceDoc(slug: string, refId: string) {
  const skill = await getSkillBySlug(slug);
  if (!skill) {
    return null;
  }

  return skill.referencedDocs.find((doc) => doc.id === refId) ?? null;
}

export function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function scoreSkillMatch(skill: SkillAtlasSkill, userNeed: string) {
  const query = normalizeForSearch(userNeed);
  if (!query) {
    return 0;
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  let score = 0;

  for (const token of tokens) {
    if (skill.searchText.includes(token)) {
      score += 2;
    }
    if (normalizeForSearch(skill.name).includes(token)) {
      score += 6;
    }
    if (normalizeForSearch(skill.category).includes(token)) {
      score += 3;
    }
    if (skill.triggerPhrases.some((phrase) => normalizeForSearch(phrase).includes(token))) {
      score += 4;
    }
    if (skill.relatedSkillNames.some((name) => normalizeForSearch(name).includes(token))) {
      score += 2;
    }
  }

  if (skill.searchText.includes(query)) {
    score += 10;
  }

  return score;
}

export async function shortlistSkills(userNeed: string, limit = 8) {
  const atlas = await getSkillAtlas();
  return [...atlas.skills]
    .map((skill) => ({ skill, score: scoreSkillMatch(skill, userNeed) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.skill.name.localeCompare(right.skill.name))
    .slice(0, limit);
}

export function formatRawBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
