#!/usr/bin/env node

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, "data", "skill-atlas.generated.json");

const sourceRoots = [
  {
    id: "installed",
    label: "Installed Codex Skills",
    kind: "installed",
    priority: 400,
    root: "/Users/nguyenquocthong/.codex/skills",
  },
  {
    id: "global",
    label: "Global Team Skills",
    kind: "global",
    priority: 320,
    root: "/Users/nguyenquocthong/claude-config/global/plugins/codex-skills/skills",
  },
  {
    id: "blackbird-repo",
    label: "Blackbird Repo Skills",
    kind: "project",
    priority: 240,
    root: "/Users/nguyenquocthong/project/blackbirdzzzz.art/skills",
  },
];

const pluginCacheRoot = "/Users/nguyenquocthong/.codex/plugins/cache/openai-curated";
const referenceExtensions = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".sh",
  ".py",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".csv",
  ".toml",
]);

const maxReferenceChars = 60_000;
const maxSearchSnippetChars = 6_000;

async function main() {
  const discoveredPluginSources = await discoverPluginSources();
  const sources = [...sourceRoots, ...discoveredPluginSources];
  const skillFiles = await discoverSkillFiles(sources);
  const rawSkills = await Promise.all(skillFiles.map((entry) => buildSkillRecord(entry, sources)));
  const deduped = dedupeSkills(rawSkills);
  const finalized = finalizeRelatedSkills(deduped);
  const stats = finalized.reduce(
    (accumulator, skill) => {
      accumulator.referenceCount += skill.referencedDocs.length;
      accumulator.rawByteCount += Buffer.byteLength(skill.raw, "utf8");
      return accumulator;
    },
    { referenceCount: 0, rawByteCount: 0 },
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceRoots: sources.map((source) => ({
      id: source.id,
      label: source.label,
      kind: source.kind,
      root: source.root,
      priority: source.priority,
    })),
    stats: {
      skillCount: finalized.length,
      referenceCount: stats.referenceCount,
      rawByteCount: stats.rawByteCount,
    },
    skills: finalized,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");
  process.stdout.write(
    `Wrote ${finalized.length} skills and ${stats.referenceCount} referenced docs to ${outputPath}\n`,
  );
}

async function discoverPluginSources() {
  const sources = [];
  try {
    const pluginDirs = await fs.readdir(pluginCacheRoot, { withFileTypes: true });
    for (const pluginDir of pluginDirs) {
      if (!pluginDir.isDirectory()) {
        continue;
      }
      const pluginRoot = path.join(pluginCacheRoot, pluginDir.name);
      const versionDirs = await fs.readdir(pluginRoot, { withFileTypes: true });
      for (const versionDir of versionDirs) {
        if (!versionDir.isDirectory()) {
          continue;
        }
        const skillsRoot = path.join(pluginRoot, versionDir.name, "skills");
        if (await fileExists(skillsRoot)) {
          sources.push({
            id: `plugin:${pluginDir.name}`,
            label: `${capitalize(pluginDir.name)} Plugin Skills`,
            kind: "plugin",
            pluginId: pluginDir.name,
            priority: 360,
            root: skillsRoot,
          });
        }
      }
    }
  } catch {
    return [];
  }

  return sources;
}

async function discoverSkillFiles(sources) {
  const found = [];
  for (const source of sources) {
    if (!(await fileExists(source.root))) {
      continue;
    }
    const walkQueue = [source.root];
    while (walkQueue.length > 0) {
      const current = walkQueue.pop();
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const target = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walkQueue.push(target);
          continue;
        }
        if (entry.isFile() && entry.name === "SKILL.md") {
          found.push({ sourceId: source.id, skillPath: target });
        }
      }
    }
  }

  return found.sort((left, right) => left.skillPath.localeCompare(right.skillPath));
}

async function buildSkillRecord(entry, sources) {
  const source = sources.find((item) => item.id === entry.sourceId);
  const raw = await fs.readFile(entry.skillPath, "utf8");
  const frontmatter = parseFrontmatter(raw);
  const skillDir = path.dirname(entry.skillPath);
  const skillName = (frontmatter.name || path.basename(skillDir)).trim();
  const displayName = source.kind === "plugin" ? `${source.pluginId}:${skillName}` : skillName;
  const triggerPhrases = unique(extractQuotedPhrases(frontmatter.description || raw)).slice(0, 16);
  const heading = extractHeading(raw) || skillName;
  const workflowHighlights = extractNumberedSteps(raw).slice(0, 8);
  const guardrails = extractSectionBullets(raw, ["Rule", "Rules", "Guardrails", "Write Safety"]).slice(0, 8);
  const referencedDocs = await collectReferencedDocs({ raw, skillDir, skillPath: entry.skillPath });

  const record = {
    slug: toSlug(displayName),
    name: displayName,
    canonicalName: skillName,
    heading,
    description: (frontmatter.description || "").trim(),
    sourceKind: source.kind,
    sourceLabel: source.label,
    sourcePath: entry.skillPath,
    allSourcePaths: [entry.skillPath],
    directory: skillDir,
    category: inferCategory(displayName, source),
    isAlias: /^alias\b/i.test(frontmatter.description || ""),
    summaryVi: inferSummaryVi(displayName, frontmatter.description || "", heading, workflowHighlights),
    triggerPhrases,
    workflowHighlights,
    guardrails,
    referencedDocs,
    raw,
    rawBytes: Buffer.byteLength(raw, "utf8"),
    sections: extractSections(raw),
    relatedSkillNames: [],
    relatedSkillSlugs: [],
    sourcePriority: source.priority,
    searchText: buildSearchText({
      displayName,
      canonicalName: skillName,
      heading,
      description: frontmatter.description || "",
      workflowHighlights,
      guardrails,
      triggerPhrases,
      referencedDocs,
      raw,
    }),
  };

  record.advisorContext = buildAdvisorContext(record);
  return record;
}

function dedupeSkills(skills) {
  const byName = new Map();

  for (const skill of skills) {
    const existing = byName.get(skill.name);
    if (!existing) {
      byName.set(skill.name, skill);
      continue;
    }

    existing.allSourcePaths = unique([...existing.allSourcePaths, skill.sourcePath]);
    if (skill.sourcePriority > existing.sourcePriority) {
      byName.set(skill.name, {
        ...skill,
        allSourcePaths: unique([...skill.allSourcePaths, ...existing.allSourcePaths]),
      });
    }
  }

  return [...byName.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function finalizeRelatedSkills(skills) {
  const nameMap = new Map(skills.map((skill) => [skill.name, skill]));
  const canonicalMap = new Map(skills.map((skill) => [skill.canonicalName, skill]));
  const allNames = [...nameMap.keys(), ...canonicalMap.keys()].sort((left, right) => right.length - left.length);

  return skills.map((skill) => {
    const related = new Map();
    for (const candidateName of allNames) {
      const candidateSkill = nameMap.get(candidateName) || canonicalMap.get(candidateName);
      if (!candidateSkill || candidateSkill.slug === skill.slug) {
        continue;
      }

      if (mentionsSkill(skill, candidateSkill, candidateName)) {
        related.set(candidateSkill.slug, candidateSkill.name);
      }
    }

    const relatedEntries = [...related.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((left, right) => left.name.localeCompare(right.name));

    return {
      ...skill,
      relatedSkillNames: relatedEntries.map((entry) => entry.name),
      relatedSkillSlugs: relatedEntries.map((entry) => entry.slug),
      advisorContext: buildAdvisorContext({
        ...skill,
        relatedSkillNames: relatedEntries.map((entry) => entry.name),
      }),
    };
  });
}

function mentionsSkill(skill, candidateSkill, candidateName) {
  const escaped = escapeRegExp(candidateName);
  const patterns = [
    new RegExp(`\\\`${escaped}\\\``, "i"),
    new RegExp(`\\b${escaped}\\b`, "i"),
    new RegExp(escapeRegExp(candidateSkill.sourcePath), "i"),
  ];

  return patterns.some((pattern) => pattern.test(skill.raw));
}

async function collectReferencedDocs({ raw, skillDir, skillPath }) {
  const discovered = new Map();
  const referencesDir = path.join(skillDir, "references");
  const repoHints = deriveRepoHints(raw);

  if (await fileExists(referencesDir)) {
    const files = await walkFiles(referencesDir);
    for (const filePath of files) {
      discovered.set(filePath, { rawToken: path.relative(skillDir, filePath), kind: "references-dir" });
    }
  }

  for (const token of extractPathTokens(raw)) {
    const normalized = sanitizeToken(token);
    if (!normalized) {
      continue;
    }

    const resolved = await resolvePathToken(normalized, skillDir, repoHints);
    const key = resolved.path || `unresolved:${normalized}`;
    if (!discovered.has(key)) {
      discovered.set(key, resolved);
    }
  }

  const refs = [];
  for (const [key, info] of discovered.entries()) {
    const ref = await buildReferenceDoc({
      idSeed: `${skillPath}:${key}`,
      displayPath: info.rawToken,
      pathToken: info.path,
      kind: info.kind,
    });
    refs.push(ref);
  }

  return refs.sort((left, right) => left.label.localeCompare(right.label));
}

async function buildReferenceDoc({ idSeed, displayPath, pathToken, kind }) {
  const ref = {
    id: createHash("sha1").update(idSeed).digest("hex").slice(0, 12),
    label: displayPath,
    path: pathToken ?? displayPath,
    exists: false,
    kind,
    title: inferDocTitle(displayPath),
    excerpt: "",
    raw: null,
    rawTruncated: false,
    size: null,
  };

  if (!pathToken || pathToken.includes("<") || pathToken.includes(">") || pathToken.includes("*")) {
    return ref;
  }

  try {
    const stat = await fs.stat(pathToken);
    if (!stat.isFile()) {
      return ref;
    }

    ref.exists = true;
    ref.size = stat.size;
    const extension = path.extname(pathToken).toLowerCase();
    if (!referenceExtensions.has(extension) && path.basename(pathToken) !== "README") {
      ref.excerpt = `Khong nap noi dung tu dong cho dinh dang ${extension || "khong ro"}.`;
      return ref;
    }

    const raw = await fs.readFile(pathToken, "utf8");
    ref.title = extractHeading(raw) || inferDocTitle(displayPath);
    ref.excerpt = summarizeText(raw);
    if (raw.length > maxReferenceChars) {
      ref.raw = `${raw.slice(0, maxReferenceChars)}\n\n[... truncated ...]`;
      ref.rawTruncated = true;
    } else {
      ref.raw = raw;
    }
  } catch {
    return ref;
  }

  return ref;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) {
    return {};
  }

  const endIndex = raw.indexOf("\n---", 4);
  if (endIndex === -1) {
    return {};
  }

  const block = raw.slice(4, endIndex).trim();
  const lines = block.split("\n");
  const result = {};
  let currentKey = null;

  for (const line of lines) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2];
      if (value === ">") {
        result[currentKey] = "";
      } else {
        result[currentKey] = value.replace(/^["']|["']$/g, "");
      }
      continue;
    }

    if (currentKey && /^\s+/.test(line)) {
      result[currentKey] = `${result[currentKey]} ${line.trim()}`.trim();
    }
  }

  return result;
}

function extractHeading(raw) {
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractQuotedPhrases(text) {
  return [...text.matchAll(/"([^"]+)"/g)].map((match) => match[1].trim());
}

function extractNumberedSteps(raw) {
  return [...raw.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => match[1].trim());
}

function extractSectionBullets(raw, sectionNames) {
  const lines = raw.split("\n");
  const found = [];
  let active = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (sectionNames.some((section) => trimmed.toLowerCase() === `${section.toLowerCase()}:`)) {
      active = true;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      active = false;
    }

    if (!active) {
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      found.push(trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim());
    } else if (trimmed === "") {
      active = false;
    }
  }

  return found;
}

function extractSections(raw) {
  const sections = [];
  const regex = /^##\s+(.+)$/gm;
  const matches = [...raw.matchAll(regex)];
  if (matches.length === 0) {
    return [];
  }

  for (let index = 0; index < matches.length; index += 1) {
    const title = matches[index][1].trim();
    const start = matches[index].index + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : raw.length;
    const body = raw.slice(start, end).trim();
    sections.push({ title, body: summarizeText(body, 700) });
  }

  return sections.slice(0, 8);
}

function extractPathTokens(raw) {
  const tokens = new Set();
  const absolute = [...raw.matchAll(/\/Users\/[^\s`"')\]]+/g)].map((match) => match[0]);
  const relative = [
    ...raw.matchAll(
      /(?:^|[`"'(\s])((?:references|docs|scripts|assets|templates|examples)\/[^\s`"')\]]+)/gm,
    ),
  ].map((match) => match[1]);

  for (const token of [...absolute, ...relative]) {
    tokens.add(token);
  }

  return [...tokens];
}

function sanitizeToken(token) {
  return token.replace(/[),.;]+$/g, "").trim();
}

async function resolvePathToken(token, skillDir, repoHints) {
  if (token.startsWith("/Users/")) {
    return { rawToken: token, path: token, kind: "absolute-path" };
  }

  if (token.startsWith("references/")) {
    return { rawToken: token, path: path.join(skillDir, token), kind: "references-dir" };
  }

  const candidates = [path.join(skillDir, token), ...repoHints.map((root) => path.join(root, token))];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return { rawToken: token, path: candidate, kind: "relative-doc" };
    }
  }

  return { rawToken: token, path: candidates[0], kind: "relative-doc" };
}

function inferDocTitle(filePath) {
  const base = path.basename(filePath).replace(/\.[a-z0-9]+$/i, "");
  return base.replace(/[-_]/g, " ");
}

function deriveRepoHints(raw) {
  const absolutePaths = [...raw.matchAll(/\/Users\/[^\s`"')\]]+/g)].map((match) => sanitizeToken(match[0]));
  const hints = [];

  for (const absolutePath of absolutePaths) {
    if (!absolutePath) {
      continue;
    }

    const phaseRoot = absolutePath.match(/^(\/Users\/[^/]+\/project\/[^/]+)\/\.phase\.json$/);
    if (phaseRoot) {
      hints.push(phaseRoot[1]);
      continue;
    }

    const repoRoot = absolutePath.match(/^(\/Users\/[^/]+\/project\/[^/]+)\/(?:docs|scripts|backend|frontend|browser_web)\//);
    if (repoRoot) {
      hints.push(repoRoot[1]);
    }
  }

  return unique(hints);
}

function summarizeText(text, max = 240) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) {
    return flat;
  }
  return `${flat.slice(0, max - 1)}…`;
}

function inferCategory(name, source) {
  if (source.kind === "plugin") {
    if (source.pluginId === "github") {
      return "Plugin GitHub";
    }
    if (source.pluginId === "canva") {
      return "Plugin Canva";
    }
    return "Plugin Skills";
  }

  if (name.startsWith("social-listening-v3-")) {
    return "Social Listening v3";
  }

  if (name.startsWith("blackbird-vm-") || name === "ssh-openclaw-vm" || name === "deploy-platform-onboard") {
    return "OpenClaw / VM";
  }

  if (name.startsWith("blackbird-")) {
    return "Blackbird Platform";
  }

  if (
    name.includes("product") ||
    name.includes("prioritize") ||
    name.includes("stakeholder") ||
    name.includes("meeting") ||
    name.includes("requirements") ||
    name.includes("stories") ||
    name.includes("prd")
  ) {
    return "Product / Analysis";
  }

  if (
    name.includes("architect") ||
    name.includes("arch-") ||
    name.includes("architecture") ||
    name.includes("design") ||
    name.includes("postgres") ||
    name.includes("openapi") ||
    name.includes("workflow") ||
    name.includes("fastapi") ||
    name.includes("async") ||
    name.includes("playwright")
  ) {
    return "Architecture / Engineering";
  }

  if (source.kind === "installed" && name.startsWith(".")) {
    return "Codex System";
  }

  if (
    name === "manage-skill" ||
    name.startsWith("skill-") ||
    name.startsWith("plugin-") ||
    name === "openai-docs" ||
    name === "imagegen"
  ) {
    return "Codex System";
  }

  return "General Engineering";
}

function inferSummaryVi(name, description, heading, workflowHighlights) {
  if (!description) {
    if (workflowHighlights.length > 0) {
      return `Skill ${name} tập trung vào: ${workflowHighlights[0].toLowerCase()}.`;
    }
    return `Skill ${name} giúp Codex xử lý một workflow chuyên biệt.`;
  }

  let normalized = description.replace(/\s+/g, " ").trim();
  normalized = normalized
    .replace(/^This skill should be used when\s+/i, "Dùng khi ")
    .replace(/^Use when the user asks to\s+/i, "Dùng khi người dùng yêu cầu ")
    .replace(/^Use when the user asks\s+/i, "Dùng khi người dùng yêu cầu ")
    .replace(/^Use when the task requires\s+/i, "Dùng khi tác vụ cần ")
    .replace(/^Use when\s+/i, "Dùng khi ")
    .replace(/^Conducts\s+/i, "Skill này thực hiện ")
    .replace(/^Create and scaffold\s+/i, "Tạo và scaffold ")
    .replace(/^Create\s+/i, "Tạo ")
    .replace(/^Generate and maintain\s+/i, "Tạo và duy trì ")
    .replace(/^Generate\s+/i, "Tạo ")
    .replace(/^Build\s+/i, "Xây dựng ")
    .replace(/^Implement\s+/i, "Triển khai ")
    .replace(/^Master\s+/i, "Làm chủ ")
    .replace(/\bor wants\b/gi, "hoặc khi bạn muốn")
    .replace(/\buser asks to\b/gi, "người dùng yêu cầu")
    .replace(/\bthe user wants\b/gi, "người dùng muốn")
    .replace(/\bthe user\b/gi, "người dùng")
    .replace(/\bworkflow\b/gi, "workflow")
    .replace(/\bcomprehensive\b/gi, "toàn diện")
    .replace(/\bdebug\b/gi, "gỡ lỗi")
    .replace(/\breview\b/gi, "đánh giá")
    .replace(/\bbackend\b/gi, "backend")
    .replace(/\bdesign\b/gi, "thiết kế")
    .replace(/\brequirements\b/gi, "yêu cầu")
    .replace(/\buser\b/gi, "người dùng")
    .replace(/\btask\b/gi, "tác vụ")
    .replace(/\bproduction\b/gi, "production")
    .replace(/\bplan\b/gi, "kế hoạch")
    .replace(/\bstrategy\b/gi, "chiến lược");

  return normalized.endsWith(".") ? normalized : `${normalized}.`;
}

function buildSearchText({ displayName, canonicalName, heading, description, workflowHighlights, guardrails, triggerPhrases, referencedDocs, raw }) {
  return normalizeForSearch(
    [
      displayName,
      canonicalName,
      heading,
      description,
      triggerPhrases.join(" "),
      workflowHighlights.join(" "),
      guardrails.join(" "),
      referencedDocs.map((doc) => `${doc.label} ${doc.title} ${doc.excerpt}`).join(" "),
      raw.slice(0, maxSearchSnippetChars),
    ].join(" "),
  );
}

function buildAdvisorContext(skill) {
  return [
    `Skill: ${skill.name}`,
    `Loai: ${skill.category}`,
    `Cong dung: ${skill.summaryVi}`,
    `Trigger phrases: ${skill.triggerPhrases.join(" | ") || "khong co"}`,
    `Workflow highlights: ${skill.workflowHighlights.join(" | ") || "khong co"}`,
    `Guardrails: ${skill.guardrails.join(" | ") || "khong co"}`,
    `Referenced docs: ${skill.referencedDocs.map((doc) => doc.label).join(" | ") || "khong co"}`,
    `Related skills: ${skill.relatedSkillNames.join(" | ") || "khong co"}`,
  ].join("\n");
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[:/]+/g, "--")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeForSearch(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function walkFiles(root) {
  const results = [];
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(target);
      } else if (entry.isFile()) {
        results.push(target);
      }
    }
  }
  return results;
}

async function fileExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
