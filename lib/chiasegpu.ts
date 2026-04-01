import { z } from "zod";

const chiasegpuBaseUrl = "https://llm.chiasegpu.vn/v1";
const defaultModel = "gpt-4.1-mini";

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
  const response = await fetch(`${chiasegpuBaseUrl}/chat/completions`, {
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
  });

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
