"use client";

import { useState } from "react";
import { useAcademyProgress } from "@/components/app-provider";
import type { PromptEvaluation } from "@/lib/evaluate-prompt";

const starterPrompts = [
  "@linux_mainbot hay tro chuyen voi codex va xu ly viec nay.\nRepo: dashboard-coordinate\nMuc tieu: tim nguyen nhan route status bi loi va sua den khi local check pass\nRule: chi hoi toi neu blocked that",
  "@gaubot hay tro chuyen voi codex va implement fix nay.\nRepo: social-listening-v3\nMuc tieu: sua docker-compose de local VM chay duoc\nRule: tu lam tiep cho den khi co evidence ro rang",
];

export function PromptLab() {
  const { completeMission, recordEvent, userId } = useAcademyProgress();
  const [selectedBot, setSelectedBot] = useState("linux_main");
  const [promptText, setPromptText] = useState(starterPrompts[0]);
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [status, setStatus] = useState("Nhap prompt va bam Evaluate.");
  const [busy, setBusy] = useState(false);

  async function handleEvaluate() {
    setBusy(true);
    setStatus("Dang cham prompt...");

    const response = await fetch("/api/attempts/prompt-evaluation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        missionSlug: "prompt-formula",
        promptText,
        selectedBot,
      }),
    });

    const payload = (await response.json()) as {
      evaluation: PromptEvaluation;
    };

    setEvaluation(payload.evaluation);
    setBusy(false);
    setStatus("Prompt da duoc cham. Xem rubric ben duoi.");

    await recordEvent("prompt_evaluated", {
      selectedBot,
      band: payload.evaluation.band,
    });
  }

  async function handleSendReady() {
    await completeMission("prompt-formula");
    setStatus("Mission Prompt Formula da duoc danh dau complete.");
  }

  return (
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <p className="eyebrow">Prompt Lab</p>
        <h1 className="section-title">Practice truoc khi gui prompt that</h1>
        <p className="section-copy">
          Prompt Lab cham theo 4 truc: clarity, context safety, operational control va bot fit. Muc tieu
          cua phase 1 la dua prompt len it nhat muc <strong>Good</strong>.
        </p>

        <div className="form-grid" style={{ marginTop: "22px" }}>
          <div className="field">
            <label htmlFor="bot">Target bot</label>
            <select
              id="bot"
              className="select"
              value={selectedBot}
              onChange={(event) => setSelectedBot(event.target.value)}
            >
              <option value="linux_main">linux_main</option>
              <option value="lavis_linux">lavis_linux</option>
              <option value="gaubot">gaubot</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              className="textarea"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
            />
          </div>

          <div className="detail-actions">
            <button type="button" className="button-primary" onClick={handleEvaluate} disabled={busy}>
              {busy ? "Evaluating..." : "Evaluate prompt"}
            </button>
            <button
              type="button"
              className="button-ghost"
              onClick={() => setPromptText(starterPrompts[1])}
            >
              Load implementation example
            </button>
          </div>
          <p className="status-message">{status}</p>
        </div>
      </section>

      <aside className="tool-stack sticky-console">
        <section className="tool-card">
          <p className="micro-label">Examples</p>
          <div className="list-stack">
            <button type="button" className="button-secondary" onClick={() => setPromptText(starterPrompts[0])}>
              Load analysis example
            </button>
            <button type="button" className="button-secondary" onClick={() => setPromptText(starterPrompts[1])}>
              Load implementation example
            </button>
          </div>
        </section>

        <section className="tool-card">
          <p className="micro-label">Rubric</p>
          <ul className="list-copy">
            <li>Clarity: repo + goal + Codex directive</li>
            <li>Context safety: issue boundary co du ro hay khong</li>
            <li>Operational control: co stop rule khong</li>
            <li>Bot fit: task text co hop bot da chon khong</li>
          </ul>
        </section>

        {evaluation ? (
          <section className="tool-card">
            <div className="score-band" data-band={evaluation.band}>
              <strong>{evaluation.band}</strong>
              <span>{evaluation.scoreTotal}/100</span>
            </div>

            <div className="score-grid">
              {Object.entries(evaluation.scoreBreakdown).map(([label, value]) => (
                <div className="score-row" key={label}>
                  <div className="detail-actions">
                    <span style={{ textTransform: "capitalize" }}>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rubric-list">
              {evaluation.rubric.map((item) => (
                <div key={item.id} className="rubric-item" data-status={item.status}>
                  <p style={{ fontWeight: 600 }}>{item.id}</p>
                  <p className="muted-copy">{item.message}</p>
                </div>
              ))}
            </div>

            <div className="tool-card" style={{ marginTop: "14px", padding: 0, border: "none", background: "transparent" }}>
              <p className="micro-label">System interpretation</p>
              <p className="muted-copy" style={{ marginTop: "8px" }}>
                {evaluation.systemInterpretation}
              </p>
              <div className="suggestion-list">
                {evaluation.rewriteSuggestions.map((suggestion) => (
                  <div key={suggestion} className="timeline-card" data-tone="warn">
                    {suggestion}
                  </div>
                ))}
              </div>
              {(evaluation.band === "Good" || evaluation.band === "Excellent") && (
                <button type="button" className="button-primary" style={{ marginTop: "16px" }} onClick={handleSendReady}>
                  Mark mission complete
                </button>
              )}
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
