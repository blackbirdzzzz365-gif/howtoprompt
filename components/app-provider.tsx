"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { quickRefs } from "@/lib/content";

type ProgressState = {
  userId: string | null;
  activePathSlug: string | null;
  completedMissionSlugs: string[];
  quickRefIds: string[];
  achievements: string[];
  reducedMotion: boolean;
  hydrated: boolean;
  selectPath: (pathSlug: string) => void;
  completeMission: (missionSlug: string) => Promise<void>;
  toggleReducedMotion: () => void;
  recordEvent: (event: string, payload?: Record<string, string | number | boolean | null>) => Promise<void>;
  isMissionComplete: (missionSlug: string) => boolean;
};

const storageKey = "openclaw-academy-progress";
const motionKey = "openclaw-academy-reduced-motion";

const ProgressContext = createContext<ProgressState | null>(null);

type StoredState = {
  userId: string;
  activePathSlug: string | null;
  completedMissionSlugs: string[];
  quickRefIds: string[];
  achievements: string[];
  reducedMotion: boolean;
};

function getQuickRefsFromMissions(missionSlugs: string[]) {
  return quickRefs
    .filter((item) => missionSlugs.includes(item.unlocksFromMission))
    .map((item) => item.id);
}

function readStoredState(): StoredState {
  if (typeof window === "undefined") {
    return {
      userId: "",
      activePathSlug: null,
      completedMissionSlugs: [],
      quickRefIds: [],
      achievements: [],
      reducedMotion: false,
    };
  }

  const raw = window.localStorage.getItem(storageKey);
  const reducedMotion = window.localStorage.getItem(motionKey) === "true";

  if (!raw) {
    return {
      userId: window.crypto.randomUUID(),
      activePathSlug: null,
      completedMissionSlugs: [],
      quickRefIds: [],
      achievements: [],
      reducedMotion,
    };
  }

  const parsed = JSON.parse(raw) as Partial<StoredState>;
  return {
    userId: parsed.userId || window.crypto.randomUUID(),
    activePathSlug: parsed.activePathSlug ?? null,
    completedMissionSlugs: parsed.completedMissionSlugs ?? [],
    quickRefIds: parsed.quickRefIds ?? [],
    achievements: parsed.achievements ?? [],
    reducedMotion,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initialState = readStoredState();
  const [userId] = useState<string | null>(initialState.userId || null);
  const [activePathSlug, setActivePathSlug] = useState<string | null>(initialState.activePathSlug);
  const [completedMissionSlugs, setCompletedMissionSlugs] = useState<string[]>(
    initialState.completedMissionSlugs,
  );
  const [quickRefIds, setQuickRefIds] = useState<string[]>(initialState.quickRefIds);
  const [achievements, setAchievements] = useState<string[]>(initialState.achievements);
  const [reducedMotion, setReducedMotion] = useState(initialState.reducedMotion);
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

      const stored: StoredState = {
        userId,
        activePathSlug,
        completedMissionSlugs,
        quickRefIds,
        achievements,
        reducedMotion,
      };
      window.localStorage.setItem(storageKey, JSON.stringify(stored));
  }, [activePathSlug, achievements, completedMissionSlugs, quickRefIds, reducedMotion, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    void fetch(`/api/me/progress?userId=${userId}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: {
        progress?: {
          activePathSlug: string | null;
          completedMissionSlugs: string[];
          quickRefIds: string[];
          achievements: string[];
        };
      }) => {
        if (!payload.progress) {
          return;
        }

        const progress = payload.progress;
        const mergedMissions = Array.from(new Set<string>(progress.completedMissionSlugs));
        const mergedQuickRefs = Array.from(
          new Set<string>([...getQuickRefsFromMissions(mergedMissions), ...progress.quickRefIds]),
        );
        const mergedAchievements = Array.from(new Set<string>(progress.achievements));

        setActivePathSlug((current) => current ?? progress.activePathSlug ?? null);
        setCompletedMissionSlugs((current) =>
          current.length > mergedMissions.length ? current : mergedMissions,
        );
        setQuickRefIds((current) =>
          current.length > mergedQuickRefs.length ? current : mergedQuickRefs,
        );
        setAchievements((current) =>
          current.length > mergedAchievements.length ? current : mergedAchievements,
        );
      })
      .catch(() => {
        // noop: UI remains local-first
      });
  }, [userId]);

  async function recordEvent(
    event: string,
    payload: Record<string, string | number | boolean | null> = {},
  ) {
    if (!userId) {
      return;
    }

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, event, payload }),
    });
  }

  function selectPath(pathSlug: string) {
    setActivePathSlug(pathSlug);
    if (!userId) {
      return;
    }

      void fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        event: "path_selected",
        payload: { pathSlug },
      }),
    });
  }

  async function completeMission(missionSlug: string) {
    if (!userId) {
      return;
    }

    const nextMissionSlugs = Array.from(new Set([...completedMissionSlugs, missionSlug]));
    const nextQuickRefIds = Array.from(new Set([...quickRefIds, ...getQuickRefsFromMissions(nextMissionSlugs)]));
    const nextAchievements = Array.from(new Set([...achievements, `mission:${missionSlug}`]));

    setCompletedMissionSlugs(nextMissionSlugs);
    setQuickRefIds(nextQuickRefIds);
    setAchievements(nextAchievements);

    await fetch("/api/progress/complete-mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, missionSlug }),
    });

    await recordEvent("mission_completed", { missionSlug });
  }

  function toggleReducedMotion() {
    setReducedMotion((current) => {
      const next = !current;
      window.localStorage.setItem(motionKey, String(next));
      return next;
    });
  }

  const value: ProgressState = {
    userId,
    activePathSlug,
    completedMissionSlugs,
    quickRefIds,
    achievements,
    reducedMotion,
    hydrated,
    selectPath,
    completeMission,
    toggleReducedMotion,
    recordEvent,
    isMissionComplete: (missionSlug: string) => completedMissionSlugs.includes(missionSlug),
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useAcademyProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useAcademyProgress must be used within AppProvider");
  }

  return context;
}
