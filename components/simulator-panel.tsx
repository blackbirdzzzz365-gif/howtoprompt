"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAcademyProgress } from "@/components/app-provider";
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
  "continue-or-new-issue": "scenario-issue-boundary",
  "choose-right-bot": "scenario-bot-fit",
  "hidden-system": "scenario-hidden-system",
  "blockers-and-auth": "scenario-blocker-auth",
  "one-section-one-issue": "scenario-issue-boundary",
};

export function SimulatorPanel() {
  const searchParams = useSearchParams();
  const initialScenarioId = searchParams.get("scenario");
  const derivedScenario = missionToScenario[initialScenarioId ?? ""] ?? initialScenarioId ?? scenarios[0]?.id;
  const [scenarioId, setScenarioId] = useState(derivedScenario);
  const [response, setResponse] = useState<SimulatorResponse | null>(null);
  const [status, setStatus] = useState("Chọn một tình huống rồi đưa ra quyết định của bạn.");
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
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <p className="eyebrow">Mô phỏng hệ thống</p>
        <h1 className="section-title">Quan sát hệ thống phản hồi theo từng lựa chọn của bạn</h1>
        <p className="section-copy">
          Phần mô phỏng này giúp bạn luyện 4 nhóm tình huống dễ gặp nhất: ranh giới issue, chọn bot, hidden
          system loop và blocker do auth hoặc rate limit.
        </p>

        <div className="field" style={{ marginTop: "20px" }}>
          <label htmlFor="scenario-picker">Tình huống</label>
          <select
            id="scenario-picker"
            className="select"
            value={scenarioId}
            onChange={(event) => {
              setScenarioId(event.target.value);
              setResponse(null);
              setStatus("Đã chuyển tình huống. Hãy chọn một phương án để xem hệ thống phản hồi ra sao.");
            }}
          >
            {scenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-card" style={{ marginTop: "18px" }}>
          <p className="micro-label">Gắn với nhiệm vụ</p>
          <h2 className="mission-title" style={{ marginTop: "6px" }}>
            {mission?.title}
          </h2>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            {scenario.summary}
          </p>
        </div>

        <div className="detail-card" style={{ marginTop: "16px" }}>
          <p className="micro-label">Tình huống đưa ra</p>
          <h3 className="mission-title" style={{ marginTop: "8px" }}>
            {step.prompt}
          </h3>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            {step.helper}
          </p>
          <div className="list-stack" style={{ marginTop: "18px" }}>
            {step.choices.map((choice) => (
              <button key={choice.id} type="button" className="button-secondary" onClick={() => runChoice(choice.id)}>
                {choice.label}
              </button>
            ))}
          </div>
        </div>

        <p className="status-message" style={{ marginTop: "16px" }}>
          {status}
        </p>
      </section>

      <aside className="tool-stack sticky-console">
        <section className="tool-card">
          <p className="micro-label">Chế độ hiển thị</p>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            Giảm chuyển động: {reducedMotion ? "đang bật" : "đang tắt"}.
          </p>
        </section>

        {response ? (
          <>
            <section className="tool-card">
              <div className="score-band" data-band={response.isCorrect ? "Good" : "Needs work"}>
                <strong>{response.isCorrect ? "Lựa chọn hợp lý" : "Có rủi ro cần lưu ý"}</strong>
              </div>
              <p className="muted-copy" style={{ marginTop: "12px" }}>
                {response.explanation}
              </p>
            </section>

            <section className="tool-card">
              <p className="micro-label">Trạng thái hệ thống</p>
              <div className="timeline-grid" style={{ marginTop: "14px" }}>
                {response.timelineState.map((item) => (
                  <div key={`${item.title}-${item.state}`} className="timeline-card" data-tone={item.tone}>
                    <p className="micro-label">{item.title}</p>
                    <h3 style={{ marginTop: "6px" }}>{item.state}</h3>
                    <p className="muted-copy" style={{ marginTop: "8px" }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="tool-card">
            <p className="micro-label">Trạng thái hệ thống</p>
            <div className="empty-state" style={{ marginTop: "14px" }}>
              Timeline sẽ hiện ra sau khi bạn chọn một phương án.
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
