#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "data");
const cacheRoot = path.join(repoRoot, ".cache", "skill-atlas");
const legacyHostOutputPath = path.join(dataDir, "skill-atlas.generated.json");
const localPluginCacheRoot = "/Users/nguyenquocthong/.codex/plugins/cache/openai-curated";

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

const catalogs = [
  {
    id: "host-codex",
    label: "Codex tren host",
    description:
      "Snapshot tu bo skill Codex dang co tren may host hien tai, gom skill cai trong Codex, skill team va plugin lien quan.",
    outputFile: "skill-atlas.host-codex.generated.json",
    async resolveSources() {
      const baseSources = [
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

      return [...baseSources, ...(await discoverLocalPluginSources(localPluginCacheRoot))];
    },
  },
  {
    id: "linuxvm-codex",
    label: "Codex tren linuxvm",
    description:
      "Snapshot tu bundle skill Codex tren linuxvm, phan anh dung bo skill ma Codex CLI va bot tren may Linux dang dung.",
    outputFile: "skill-atlas.linuxvm-codex.generated.json",
    remoteHost: "linuxvm",
    async resolveSources() {
      const baseSources = [
        {
          id: "linuxvm-installed",
          label: "Linux VM Codex Skills",
          kind: "installed",
          priority: 420,
          root: "/home/blackbird/.codex/skills",
        },
      ];

      return [...baseSources, ...(await discoverRemotePluginSources("linuxvm"))];
    },
  },
  {
    id: "linuxvm-openclaw",
    label: "OpenClaw tren linuxvm",
    description:
      "Snapshot tu bundle skill OpenClaw tren linuxvm, gom skill custom, builtin va workspace overlay ma bot dang nap trong runtime.",
    outputFile: "skill-atlas.linuxvm-openclaw.generated.json",
    remoteHost: "linuxvm",
    async resolveSources() {
      const baseSources = [
        {
          id: "linuxvm-openclaw-custom",
          label: "Linux VM OpenClaw Skills",
          kind: "openclaw-custom",
          priority: 420,
          root: "/home/blackbird/.openclaw/skills",
        },
        {
          id: "linuxvm-openclaw-builtin",
          label: "Linux VM OpenClaw Built-ins",
          kind: "openclaw-builtin",
          priority: 320,
          root: "/home/blackbird/.openclaw/skills-builtin",
        },
      ];

      return [...baseSources, ...(await discoverRemoteOpenClawWorkspaceSources("linuxvm"))];
    },
  },
];

async function main() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(cacheRoot, { recursive: true });

  const summaries = [];

  for (const catalog of catalogs) {
    const rawSources = await catalog.resolveSources();
    const sources = catalog.remoteHost
      ? await mirrorRemoteSources(catalog.id, catalog.remoteHost, rawSources)
      : rawSources.map((source) => ({ ...source, logicalRoot: source.root }));

    const skillFiles = await discoverSkillFiles(sources);
    const pathMappings = sources
      .filter((source) => source.logicalRoot && source.logicalRoot !== source.root)
      .map((source) => ({ realRoot: source.root, logicalRoot: source.logicalRoot }));
    const rawSkills = await Promise.all(
      skillFiles.map((entry) => buildSkillRecord(entry, sources, pathMappings)),
    );
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
      atlasId: catalog.id,
      atlasLabel: catalog.label,
      atlasDescription: catalog.description,
      generatedAt: new Date().toISOString(),
      sourceRoots: sources.map((source) => ({
        id: source.id,
        label: source.label,
        kind: source.kind,
        root: source.logicalRoot || source.root,
        priority: source.priority,
      })),
      stats: {
        skillCount: finalized.length,
        referenceCount: stats.referenceCount,
        rawByteCount: stats.rawByteCount,
      },
      skills: finalized,
    };

    const outputPath = path.join(dataDir, catalog.outputFile);
    await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");

    if (catalog.id === "host-codex") {
      await fs.writeFile(legacyHostOutputPath, JSON.stringify(payload, null, 2), "utf8");
    }

    summaries.push(`${catalog.id}: ${finalized.length} skills / ${stats.referenceCount} refs`);
  }

  process.stdout.write(`Synced ${summaries.length} catalogs\n${summaries.join("\n")}\n`);
}

async function discoverLocalPluginSources(pluginCacheRoot) {
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

async function discoverRemotePluginSources(host) {
  const pluginCacheRoot = "/home/blackbird/.codex/plugins/cache/openai-curated";
  const output = await runCommand("ssh", [
    "-o",
    "BatchMode=yes",
    host,
    `if [ -d '${pluginCacheRoot}' ]; then find '${pluginCacheRoot}' -mindepth 3 -maxdepth 3 -type d -name skills -print; fi`,
  ]);

  const skillsRoots = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return skillsRoots.map((skillsRoot) => {
    const relative = path.relative(pluginCacheRoot, skillsRoot).split(path.sep);
    const pluginId = relative[0] || "plugin";
    return {
      id: `linuxvm-plugin:${pluginId}`,
      label: `${capitalize(pluginId)} Plugin Skills`,
      kind: "plugin",
      pluginId,
      priority: 360,
      root: skillsRoot,
    };
  });
}

async function discoverRemoteOpenClawWorkspaceSources(host) {
  const output = await runCommand("ssh", [
    "-o",
    "BatchMode=yes",
    host,
    `find /home/blackbird/.openclaw -maxdepth 1 -type d -name 'workspace-*' -print`,
  ]);

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((workspaceRoot) => ({
      id: `linuxvm-openclaw-workspace:${path.basename(workspaceRoot)}`,
      label: "Linux VM OpenClaw Workspace Skills",
      kind: "openclaw-workspace",
      priority: 520,
      root: path.join(workspaceRoot, "skills"),
    }));
}

async function mirrorRemoteSources(catalogId, host, sources) {
  const prepared = [];

  for (const source of sources) {
    const remoteExists = await runCommand("ssh", [
      "-o",
      "BatchMode=yes",
      host,
      `[ -d '${source.root}' ] && printf yes || printf no`,
    ]);
    if (remoteExists.trim() !== "yes") {
      continue;
    }

    const mirrorRoot = path.join(cacheRoot, catalogId, source.root.replace(/^\/+/, ""));
    await fs.mkdir(mirrorRoot, { recursive: true });
    await runCommand("rsync", [
      "-az",
      "--delete",
      `${host}:${source.root}/`,
      `${mirrorRoot}/`,
    ]);

    prepared.push({
      ...source,
      root: mirrorRoot,
      logicalRoot: source.root,
    });
  }

  return prepared;
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
          found.push({
            sourceId: source.id,
            skillPath: target,
            logicalSkillPath: toLogicalPath(target, source),
          });
        }
      }
    }
  }

  return found.sort((left, right) => left.logicalSkillPath.localeCompare(right.logicalSkillPath));
}

async function buildSkillRecord(entry, sources, pathMappings) {
  const source = sources.find((item) => item.id === entry.sourceId);
  const raw = await fs.readFile(entry.skillPath, "utf8");
  const frontmatter = parseFrontmatter(raw);
  const skillDir = path.dirname(entry.skillPath);
  const logicalSkillPath = entry.logicalSkillPath || entry.skillPath;
  const logicalSkillDir = path.dirname(logicalSkillPath);
  const skillName = (frontmatter.name || path.basename(skillDir)).trim();
  const displayName = source.kind === "plugin" ? `${source.pluginId}:${skillName}` : skillName;
  const triggerPhrases = unique(extractQuotedPhrases(frontmatter.description || raw)).slice(0, 16);
  const heading = extractHeading(raw) || skillName;
  const workflowHighlights = extractNumberedSteps(raw).slice(0, 8);
  const guardrails = extractSectionBullets(raw, ["Rule", "Rules", "Guardrails", "Write Safety"]).slice(0, 8);
  const referencedDocs = await collectReferencedDocs({
    raw,
    skillDir,
    logicalSkillDir,
    skillPath: entry.skillPath,
    logicalSkillPath,
    pathMappings,
  });

  const record = {
    slug: toSlug(displayName),
    name: displayName,
    canonicalName: skillName,
    heading,
    description: (frontmatter.description || "").trim(),
    sourceKind: source.kind,
    sourceLabel: source.label,
    sourcePath: logicalSkillPath,
    allSourcePaths: [logicalSkillPath],
    directory: logicalSkillDir,
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

async function collectReferencedDocs({
  raw,
  skillDir,
  logicalSkillDir,
  logicalSkillPath,
  pathMappings,
}) {
  const discovered = new Map();
  const referencesDir = path.join(skillDir, "references");
  const repoHints = deriveRepoHints(raw);

  if (await fileExists(referencesDir)) {
    const files = await walkFiles(referencesDir);
    for (const filePath of files) {
      discovered.set(filePath, {
        rawToken: path.relative(skillDir, filePath),
        displayPath: toDisplayPath(filePath, pathMappings),
        path: filePath,
        kind: "references-dir",
      });
    }
  }

  for (const token of extractPathTokens(raw)) {
    const normalized = sanitizeToken(token);
    if (!normalized) {
      continue;
    }

    const resolved = await resolvePathToken(normalized, skillDir, logicalSkillDir, repoHints, pathMappings);
    const key = resolved.path || `unresolved:${normalized}`;
    if (!discovered.has(key)) {
      discovered.set(key, resolved);
    }
  }

  const refs = [];
  for (const [key, info] of discovered.entries()) {
    const ref = await buildReferenceDoc({
      idSeed: `${logicalSkillPath}:${key}`,
      displayPath: info.displayPath || info.rawToken,
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
    path: displayPath,
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
  const absolute = [...raw.matchAll(/\/(?:Users|home)\/[^\s`"')\]]+/g)].map((match) => match[0]);
  const relative = [
    ...raw.matchAll(
      /(?:^|[`"'(\s])((?:references|docs|scripts|assets|templates|examples|memory)\/[^\s`"')\]]+)/gm,
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

async function resolvePathToken(token, skillDir, logicalSkillDir, repoHints, pathMappings) {
  if (path.isAbsolute(token)) {
    return {
      rawToken: token,
      displayPath: token,
      path: mapLogicalToRealPath(token, pathMappings) || token,
      kind: "absolute-path",
    };
  }

  if (token.startsWith("references/")) {
    return {
      rawToken: token,
      displayPath: path.join(logicalSkillDir, token),
      path: path.join(skillDir, token),
      kind: "references-dir",
    };
  }

  const logicalCandidates = [path.join(logicalSkillDir, token), ...repoHints.map((root) => path.join(root, token))];
  const realCandidates = [path.join(skillDir, token), ...logicalCandidates.map((candidate) => mapLogicalToRealPath(candidate, pathMappings) || candidate)];

  for (let index = 0; index < realCandidates.length; index += 1) {
    const candidate = realCandidates[index];
    if (await fileExists(candidate)) {
      return {
        rawToken: token,
        displayPath: logicalCandidates[index] || token,
        path: candidate,
        kind: "relative-doc",
      };
    }
  }

  return {
    rawToken: token,
    displayPath: logicalCandidates[0] || token,
    path: realCandidates[0],
    kind: "relative-doc",
  };
}

function inferDocTitle(filePath) {
  const base = path.basename(filePath).replace(/\.[a-z0-9]+$/i, "");
  return base.replace(/[-_]/g, " ");
}

function deriveRepoHints(raw) {
  const absolutePaths = [...raw.matchAll(/\/(?:Users|home)\/[^\s`"')\]]+/g)].map((match) =>
    sanitizeToken(match[0]),
  );
  const hints = [];

  for (const absolutePath of absolutePaths) {
    if (!absolutePath) {
      continue;
    }

    const phaseRoot = absolutePath.match(/^(\/(?:Users|home)\/[^/]+\/project\/[^/]+)\/\.phase\.json$/);
    if (phaseRoot) {
      hints.push(phaseRoot[1]);
      continue;
    }

    const repoRoot = absolutePath.match(
      /^(\/(?:Users|home)\/[^/]+\/project\/[^/]+)\/(?:docs|scripts|backend|frontend|browser_web)\//,
    );
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

  if (source.kind === "openclaw-builtin") {
    return "OpenClaw Built-ins";
  }

  if (source.kind === "openclaw-workspace") {
    return "OpenClaw Workspace";
  }

  if (source.kind === "openclaw-custom") {
    return "OpenClaw Skills";
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
    .replace(/\bdebug\b/gi, "gỡ lỗi")
    .replace(/\breview\b/gi, "đánh giá")
    .replace(/\bbackend\b/gi, "backend")
    .replace(/\bdesign\b/gi, "thiết kế")
    .replace(/\brequirements\b/gi, "yêu cầu")
    .replace(/\buser\b/gi, "người dùng")
    .replace(/\btask\b/gi, "tác vụ")
    .replace(/\bplan\b/gi, "kế hoạch")
    .replace(/\bstrategy\b/gi, "chiến lược");

  return normalized.endsWith(".") ? normalized : `${normalized}.`;
}

function buildSearchText({
  displayName,
  canonicalName,
  heading,
  description,
  workflowHighlights,
  guardrails,
  triggerPhrases,
  referencedDocs,
  raw,
}) {
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

function toLogicalPath(realPath, source) {
  if (!source.logicalRoot || source.logicalRoot === source.root) {
    return realPath;
  }

  return path.join(source.logicalRoot, path.relative(source.root, realPath));
}

function toDisplayPath(realPath, pathMappings) {
  return mapRealToLogicalPath(realPath, pathMappings) || realPath;
}

function mapLogicalToRealPath(logicalPath, pathMappings) {
  for (const mapping of pathMappings) {
    if (logicalPath === mapping.logicalRoot || logicalPath.startsWith(`${mapping.logicalRoot}/`)) {
      return path.join(mapping.realRoot, path.relative(mapping.logicalRoot, logicalPath));
    }
  }

  return null;
}

function mapRealToLogicalPath(realPath, pathMappings) {
  for (const mapping of pathMappings) {
    if (realPath === mapping.realRoot || realPath.startsWith(`${mapping.realRoot}/`)) {
      return path.join(mapping.logicalRoot, path.relative(mapping.realRoot, realPath));
    }
  }

  return null;
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

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}: ${stderr || stdout}`));
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
