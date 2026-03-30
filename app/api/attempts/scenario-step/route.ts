import { resolveScenarioChoice } from "@/lib/scenario-engine";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    scenarioId?: string;
    stepId?: string;
    choiceId?: string;
  };

  if (!body.scenarioId || !body.stepId || !body.choiceId) {
    return Response.json({ error: "scenarioId, stepId and choiceId are required" }, { status: 400 });
  }

  try {
    const result = resolveScenarioChoice(body.scenarioId, body.stepId, body.choiceId);
    return Response.json({
      missionSlug: result.scenario.missionSlug,
      isCorrect: result.choice.isCorrect,
      feedback: result.choice.feedback,
      explanation: result.choice.explanation,
      timelineState: result.choice.timelineState,
      marksMissionComplete: result.choice.marksMissionComplete,
      nextStepId: result.choice.nextStepId,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Scenario resolution failed" },
      { status: 404 },
    );
  }
}
