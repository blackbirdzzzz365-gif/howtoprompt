import { promises as fs } from "node:fs";
import path from "node:path";
import {
  defaultSkillAtlasCatalogId,
  type SkillAtlasCatalogId,
} from "@/lib/skill-atlas-catalogs";

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
  atlasId: SkillAtlasCatalogId;
  atlasLabel: string;
  atlasDescription: string;
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

const atlasFiles: Record<SkillAtlasCatalogId, string> = {
  "host-codex": "skill-atlas.host-codex.generated.json",
  "linuxvm-codex": "skill-atlas.linuxvm-codex.generated.json",
  "linuxvm-openclaw": "skill-atlas.linuxvm-openclaw.generated.json",
};

const cachedAtlases = new Map<SkillAtlasCatalogId, SkillAtlasDb>();

function getAtlasPath(atlasId: SkillAtlasCatalogId) {
  return path.join(process.cwd(), "data", atlasFiles[atlasId]);
}

export async function getSkillAtlas(atlasId: SkillAtlasCatalogId = defaultSkillAtlasCatalogId) {
  const cached = cachedAtlases.get(atlasId);
  if (cached) {
    return cached;
  }

  const raw = await fs.readFile(getAtlasPath(atlasId), "utf8");
  const parsed = JSON.parse(raw) as SkillAtlasDb;
  cachedAtlases.set(atlasId, parsed);
  return parsed;
}

export async function getSkillAtlasList(atlasId: SkillAtlasCatalogId = defaultSkillAtlasCatalogId) {
  const atlas = await getSkillAtlas(atlasId);
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

export async function getSkillBySlug(
  atlasIdOrSlug: SkillAtlasCatalogId | string = defaultSkillAtlasCatalogId,
  maybeSlug?: string,
) {
  const atlasId = maybeSlug
    ? (atlasIdOrSlug as SkillAtlasCatalogId)
    : defaultSkillAtlasCatalogId;
  const slug = maybeSlug ?? atlasIdOrSlug;
  const atlas = await getSkillAtlas(atlasId);
  return atlas.skills.find((skill) => skill.slug === slug) ?? null;
}

export async function getSkillReferenceDoc(
  atlasIdOrSlug: SkillAtlasCatalogId | string = defaultSkillAtlasCatalogId,
  slugOrRefId: string,
  maybeRefId?: string,
) {
  const atlasId = maybeRefId
    ? (atlasIdOrSlug as SkillAtlasCatalogId)
    : defaultSkillAtlasCatalogId;
  const slug = maybeRefId ? slugOrRefId : atlasIdOrSlug;
  const refId = maybeRefId ?? slugOrRefId;
  const skill = await getSkillBySlug(atlasId, slug);
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

export async function shortlistSkills(
  atlasIdOrUserNeed: SkillAtlasCatalogId | string = defaultSkillAtlasCatalogId,
  userNeedOrLimit?: string | number,
  maybeLimit = 8,
) {
  const atlasId =
    typeof userNeedOrLimit === "string"
      ? (atlasIdOrUserNeed as SkillAtlasCatalogId)
      : defaultSkillAtlasCatalogId;
  const userNeed =
    typeof userNeedOrLimit === "string"
      ? userNeedOrLimit
      : (atlasIdOrUserNeed as string);
  const limit = typeof userNeedOrLimit === "number" ? userNeedOrLimit : maybeLimit;
  const atlas = await getSkillAtlas(atlasId);
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
