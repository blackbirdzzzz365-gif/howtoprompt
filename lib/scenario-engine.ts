import { getScenario } from "@/lib/content";

export function resolveScenarioChoice(scenarioId: string, stepId: string, choiceId: string) {
  const scenario = getScenario(scenarioId);
  if (!scenario) {
    throw new Error("Scenario not found");
  }

  const step = scenario.steps.find((item) => item.id === stepId);
  if (!step) {
    throw new Error("Scenario step not found");
  }

  const choice = step.choices.find((item) => item.id === choiceId);
  if (!choice) {
    throw new Error("Scenario choice not found");
  }

  return {
    scenario,
    step,
    choice,
    nextStep: choice.nextStepId
      ? scenario.steps.find((item) => item.id === choice.nextStepId) ?? null
      : null,
  };
}
