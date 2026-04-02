"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAcademyProgress } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { DetailPageLayout, StickyAside } from "@/components/ui/layout";
import { Surface } from "@/components/ui/surface";
import { missions, scenarios } from "@/lib/content";

type SimulatorResponse = {
  explanation: string;
  feedback: string;
  isCorrect: boolean;
  missionSlug: string;
  timelineState: Array<{
    title: string;
    state: string;
    description: string;
    tone: "neutral" | "success" | "warn" | "danger";
  }>;
  marksMissionComplete: boolean;
};

const missionToScenario: Record<string, string> = {
  "read-the-board": "scenario-runtime-choice",
  "one-gate-one-prompt": "scenario-gate-discipline",
  "production-raid": "scenario-production-verdict",
  "direction-lock": "scenario-contained-fix",
  "merge-or-replay": "scenario-merge-gate",
};

export function SimulatorPanel() {
  const searchParams = useSearchParams();
  const initialScenarioId = searchParams.get("scenario");
  const derivedScenario = missionToScenario[initialScenarioId ?? ""] ?? initialScenarioId ?? scenarios[0]?.id;
  const [scenarioId, setScenarioId] = useState(derivedScenario);
  const [response, setResponse] = useState<SimulatorResponse | null>(null);
  const [status, setStatus] = useState("Chon scenario roi thuc hien mot quyet dinh.");
  const { completeMission, recordEvent, reducedMotion } = useAcademyProgress();

  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const step = scenario.steps[0];
  const mission = missions.find((item) => item.slug === scenario.missionSlug);

  async function runChoice(choiceId: string) {
    const result = await fetch("/api/attempts/scenario-step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId,
        stepId: step.id,
        choiceId,
      }),
    }).then((serverResponse) => serverResponse.json() as Promise<SimulatorResponse>);

    setResponse(result);
    setStatus(result.feedback);
    await recordEvent("scenario_played", {
      scenarioId,
      choiceId,
      correct: result.isCorrect,
    });

    if (result.marksMissionComplete) {
      await completeMission(result.missionSlug);
    }
  }

  return (
    <DetailPageLayout>
      <Surface as="section" variant="panelStrong" className="section-block">
        <p className="eyebrow">System Simulator</p>
        <h1 className="section-title">Xem game board phan ung theo lua chon cua ban</h1>
        <p className="section-copy">
          Simulator nay day 6 quyet dinh can nhat: chon dung control surface, giu gate discipline, doc verdict,
          khoa huong, giu merge gate, va recover auth tren linuxvm.
        </p>

        <Field label="Scenario" htmlFor="scenario-picker" className="field" style={{ marginTop: "20px" }}>
          <SelectField
            id="scenario-picker"
            value={scenarioId}
            onChange={(event) => {
              setScenarioId(event.target.value);
              setResponse(null);
              setStatus("Scenario da doi. Chon mot phuong an de xem timeline.");
            }}
          >
            {scenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </SelectField>
        </Field>

        <Surface variant="detail" style={{ marginTop: "18px" }}>
          <p className="micro-label">Stage anchor</p>
          <h2 className="mission-title" style={{ marginTop: "6px" }}>
            {mission?.title}
          </h2>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            {scenario.summary}
          </p>
        </Surface>

        <Surface variant="detail" style={{ marginTop: "16px" }}>
          <p className="micro-label">Prompt</p>
          <h3 className="mission-title" style={{ marginTop: "8px" }}>
            {step.prompt}
          </h3>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            {step.helper}
          </p>
          <div className="list-stack" style={{ marginTop: "18px" }}>
            {step.choices.map((choice) => (
              <Button key={choice.id} variant="secondary" onClick={() => runChoice(choice.id)}>
                {choice.label}
              </Button>
            ))}
          </div>
        </Surface>

        <p className="status-message" style={{ marginTop: "16px" }}>
          {status}
        </p>
      </Surface>

      <StickyAside>
        <Surface as="section" variant="tool">
          <p className="micro-label">Simulator mode</p>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            Reduced motion: {reducedMotion ? "on" : "off"}.
          </p>
        </Surface>

        {response ? (
          <>
            <Surface as="section" variant="tool">
              <div className="score-band" data-band={response.isCorrect ? "Good" : "Needs work"}>
                <strong>{response.isCorrect ? "Correct path" : "Risk detected"}</strong>
              </div>
              <p className="muted-copy" style={{ marginTop: "12px" }}>
                {response.explanation}
              </p>
            </Surface>

            <Surface as="section" variant="tool">
              <p className="micro-label">Timeline state</p>
              <div className="timeline-grid" style={{ marginTop: "14px" }}>
                {response.timelineState.map((item) => (
                  <Surface key={`${item.title}-${item.state}`} variant="timeline" data-tone={item.tone}>
                    <p className="micro-label">{item.title}</p>
                    <h3 style={{ marginTop: "6px" }}>{item.state}</h3>
                    <p className="muted-copy" style={{ marginTop: "8px" }}>
                      {item.description}
                    </p>
                  </Surface>
                ))}
              </div>
            </Surface>
          </>
        ) : (
          <Surface as="section" variant="tool">
            <p className="micro-label">Timeline state</p>
            <div className="empty-state" style={{ marginTop: "14px" }}>
              Timeline se xuat hien sau khi ban chon mot phuong an.
            </div>
          </Surface>
        )}
      </StickyAside>
    </DetailPageLayout>
  );
}
