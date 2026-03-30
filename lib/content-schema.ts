import { z } from "zod";

export const lessonBlockSchema = z.object({
  title: z.string(),
  body: z.string(),
  bullets: z.array(z.string()).default([]),
});

export const quickRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()),
  unlocksFromMission: z.string(),
});

export const pathSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  recommendedFor: z.string(),
  primaryMissionSlugs: z.array(z.string()),
});

export const missionSchema = z.object({
  slug: z.string(),
  order: z.number(),
  title: z.string(),
  tagline: z.string(),
  duration: z.string(),
  outcome: z.string(),
  focus: z.string(),
  quickRefId: z.string(),
  practiceMode: z.enum(["prompt-lab", "simulator", "mixed"]),
  lessonBlocks: z.array(lessonBlockSchema),
  evidenceBullets: z.array(z.string()),
});

export const scenarioChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  feedback: z.string(),
  explanation: z.string(),
  isCorrect: z.boolean(),
  timelineState: z.array(
    z.object({
      title: z.string(),
      state: z.string(),
      description: z.string(),
      tone: z.enum(["neutral", "success", "warn", "danger"]),
    }),
  ),
  nextStepId: z.string().nullable().default(null),
  marksMissionComplete: z.boolean().default(false),
});

export const scenarioStepSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  helper: z.string(),
  choices: z.array(scenarioChoiceSchema),
});

export const scenarioSchema = z.object({
  id: z.string(),
  missionSlug: z.string(),
  title: z.string(),
  summary: z.string(),
  steps: z.array(scenarioStepSchema),
});

export type LearningPath = z.infer<typeof pathSchema>;
export type Mission = z.infer<typeof missionSchema>;
export type QuickRef = z.infer<typeof quickRefSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type ScenarioStep = z.infer<typeof scenarioStepSchema>;
export type ScenarioChoice = z.infer<typeof scenarioChoiceSchema>;
