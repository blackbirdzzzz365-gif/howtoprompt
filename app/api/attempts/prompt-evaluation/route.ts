import { evaluatePrompt } from "@/lib/evaluate-prompt";
import { incrementAttempts, recordEvent } from "@/lib/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    missionSlug?: string;
    promptText?: string;
    selectedBot?: string;
  };

  const promptText = body.promptText?.trim() ?? "";
  if (!promptText) {
    return Response.json({ error: "promptText is required" }, { status: 400 });
  }

  const evaluation = evaluatePrompt(promptText, body.selectedBot ?? "");

  if (body.userId) {
    await incrementAttempts(body.userId);
    await recordEvent(body.userId, "prompt_evaluated_server", {
      band: evaluation.band,
      missionSlug: body.missionSlug ?? null,
    });
  }

  return Response.json({ evaluation });
}
