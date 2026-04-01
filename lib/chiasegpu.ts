import { z } from "zod";

const chiasegpuBaseUrl = "https://llm.chiasegpu.vn/v1";
const defaultModel = "gpt-4.1-mini";
const modelCache = new Map<string, string>();
const preferredModels = [
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-4o-mini",
  "gpt-4o",
  "claude-haiku-4-5",
  "claude-3-5-haiku-latest",
  "gemini-2.0-flash",
];

const choiceSchema = z.object({
  message: z
    .object({
      content: z.union([
        z.string(),
        z.array(
          z.object({
            type: z.string().optional(),
            text: z.string().optional(),
          }),
        ),
      ]),
    })
    .optional(),
});

const completionSchema = z.object({
  choices: z.array(choiceSchema).default([]),
});

const modelsSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .default([]),
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callChiasegpuChat(input: {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: ChatMessage[];
}) {
  const response = await fetchWithTimeout(`${chiasegpuBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model || defaultModel,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.maxTokens ?? 1800,
      messages: input.messages,
    }),
  }, 24000);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`chiasegpu_error:${response.status}:${body.slice(0, 500)}`);
  }

  const parsed = completionSchema.parse(await response.json());
  return extractMessageText(parsed);
}

export function extractMessageText(payload: z.infer<typeof completionSchema>) {
  const firstChoice = payload.choices[0];
  const content = firstChoice?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text || "")
      .join("")
      .trim();
  }

  return "";
}

export function parseLooseJson(text: string) {
  const direct = tryParseJson(text);
  if (direct) {
    return direct;
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return tryParseJson(text.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function getDefaultChiasegpuModel() {
  return defaultModel;
}

export async function resolveChiasegpuModel(apiKey: string) {
  const cached = modelCache.get(apiKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithTimeout(
      `${chiasegpuBaseUrl}/models`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      10000,
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`chiasegpu_models_error:${response.status}:${body.slice(0, 300)}`);
    }

    const payload = modelsSchema.parse(await response.json());
    const availableModels = payload.data.map((item) => item.id);
    const selected = choosePreferredModel(availableModels);
    modelCache.set(apiKey, selected);
    return selected;
  } catch {
    return defaultModel;
  }
}

function choosePreferredModel(availableModels: string[]) {
  for (const preferredModel of preferredModels) {
    const exact = availableModels.find((model) => model === preferredModel);
    if (exact) {
      return exact;
    }
  }

  for (const preferredModel of preferredModels) {
    const loose = availableModels.find((model) => model.includes(preferredModel));
    if (loose) {
      return loose;
    }
  }

  return availableModels[0] || defaultModel;
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`chiasegpu_timeout:${timeoutMs}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
