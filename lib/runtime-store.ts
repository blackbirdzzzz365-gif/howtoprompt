import { promises as fs } from "node:fs";
import path from "node:path";
import { getMission, quickRefs } from "@/lib/content";

type AnalyticsEvent = {
  id: string;
  userId: string;
  event: string;
  payload: Record<string, string | number | boolean | null>;
  createdAt: string;
};

type UserProgress = {
  userId: string;
  activePathSlug: string | null;
  completedMissionSlugs: string[];
  achievements: string[];
  quickRefIds: string[];
  attempts: number;
  updatedAt: string;
};

type RuntimeStore = {
  users: Record<string, UserProgress>;
  events: AnalyticsEvent[];
};

const dataDir = path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "runtime-store.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    const initial: RuntimeStore = { users: {}, events: [] };
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as RuntimeStore;
}

async function writeStore(store: RuntimeStore) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function defaultProgress(userId: string): UserProgress {
  return {
    userId,
    activePathSlug: null,
    completedMissionSlugs: [],
    achievements: [],
    quickRefIds: [],
    attempts: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getUserProgress(userId: string) {
  const store = await readStore();
  return store.users[userId] ?? defaultProgress(userId);
}

export async function savePathSelection(userId: string, activePathSlug: string) {
  const store = await readStore();
  const progress = store.users[userId] ?? defaultProgress(userId);
  progress.activePathSlug = activePathSlug;
  progress.updatedAt = new Date().toISOString();
  store.users[userId] = progress;
  await writeStore(store);
  return progress;
}

export async function completeMission(userId: string, missionSlug: string) {
  const store = await readStore();
  const progress = store.users[userId] ?? defaultProgress(userId);
  if (!progress.completedMissionSlugs.includes(missionSlug)) {
    progress.completedMissionSlugs.push(missionSlug);
    progress.achievements.push(`mission:${missionSlug}`);
  }

  const mission = getMission(missionSlug);
  if (mission && !progress.quickRefIds.includes(mission.quickRefId)) {
    progress.quickRefIds.push(mission.quickRefId);
  }

  const unlockedAll = quickRefs.every((item) => progress.quickRefIds.includes(item.id));
  if (unlockedAll && !progress.achievements.includes("academy:quick-ref-full")) {
    progress.achievements.push("academy:quick-ref-full");
  }

  progress.updatedAt = new Date().toISOString();
  store.users[userId] = progress;
  await writeStore(store);
  return progress;
}

export async function incrementAttempts(userId: string) {
  const store = await readStore();
  const progress = store.users[userId] ?? defaultProgress(userId);
  progress.attempts += 1;
  progress.updatedAt = new Date().toISOString();
  store.users[userId] = progress;
  await writeStore(store);
  return progress;
}

export async function recordEvent(
  userId: string,
  event: string,
  payload: Record<string, string | number | boolean | null> = {},
) {
  const store = await readStore();
  const entry: AnalyticsEvent = {
    id: crypto.randomUUID(),
    userId,
    event,
    payload,
    createdAt: new Date().toISOString(),
  };
  store.events.push(entry);
  await writeStore(store);
  return entry;
}

export async function getAchievements(userId: string) {
  const progress = await getUserProgress(userId);
  return progress.achievements;
}

export async function getOpsSummary() {
  const store = await readStore();
  const eventCountByType = store.events.reduce<Record<string, number>>((accumulator, event) => {
    accumulator[event.event] = (accumulator[event.event] ?? 0) + 1;
    return accumulator;
  }, {});

  const completedMissionCount = Object.values(store.users).reduce(
    (count, progress) => count + progress.completedMissionSlugs.length,
    0,
  );

  return {
    activeUsers: Object.keys(store.users).length,
    completedMissionCount,
    totalEvents: store.events.length,
    eventCountByType,
    recentEvents: store.events.slice(-8).reverse(),
  };
}
