"use client";

import { useState } from "react";
import { useAcademyProgress } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { DetailPageLayout, StickyAside } from "@/components/ui/layout";
import { Field, PromptTextarea, SelectField } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import type { PromptEvaluation } from "@/lib/evaluate-prompt";

const starterPrompts = [
  {
    id: "audit",
    label: "Production audit",
    selectedBot: "linux_main",
    prompt:
      "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.\nRepo: social-listening-v3\nMuc tieu: chay live case ngu-hoa-market-sentiment va tpbank-evo-general-feedback, doi chieu phase active, tao checkpoint verdict.\nRule: dung o checkpoint verdict, chua implement.",
  },
  {
    id: "analysis",
    label: "Direction analysis",
    selectedBot: "lavis_linux",
    prompt:
      "@lavis_linux hay tro chuyen voi codex de phan tich checkpoint verdict nay.\nRepo: social-listening-v3\nMuc tieu: neu 3 root cause chinh va de xuat contained-fix hay new-phase theo thu tu uu tien.\nRule: chua code, chua merge, chi phan tich den khi ro huong.",
  },
  {
    id: "executor",
    label: "Phase executor",
    selectedBot: "gaubot",
    prompt:
      "@gaubot hay tro chuyen voi codex va dung skill social-listening-v3-phase-executor.\nRepo: social-listening-v3\nMuc tieu: lay latest main, tao branch codex/phase-10-answer-quality, dong goi docs, break checkpoint, implement, validate, tao candidate summary.\nRule: dung o candidate summary, khong merge, khong deploy.",
  },
];

export function PromptLab() {
  const { completeMission, recordEvent, userId } = useAcademyProgress();
  const [selectedBot, setSelectedBot] = useState(starterPrompts[0].selectedBot);
  const [promptText, setPromptText] = useState(starterPrompts[0].prompt);
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [status, setStatus] = useState("Nhap prompt va bam Evaluate.");
  const [busy, setBusy] = useState(false);

  function loadExample(exampleId: string) {
    const example = starterPrompts.find((item) => item.id === exampleId) ?? starterPrompts[0];
    setSelectedBot(example.selectedBot);
    setPromptText(example.prompt);
    setEvaluation(null);
    setStatus(`Da load example: ${example.label}.`);
  }

  async function handleEvaluate() {
    setBusy(true);
    setStatus("Dang cham prompt...");

    const response = await fetch("/api/attempts/prompt-evaluation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        missionSlug: "one-gate-one-prompt",
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
    await completeMission("one-gate-one-prompt");
    setStatus("Stage One Gate, One Prompt da duoc danh dau complete.");
  }

  return (
    <DetailPageLayout>
      <Surface as="section" variant="panelStrong" className="section-block">
        <p className="eyebrow">Prompt Lab</p>
        <h1 className="section-title">Practice gate prompts truoc khi gui prompt that</h1>
        <p className="section-copy">
          Prompt Lab cham theo 4 truc: clarity, context safety, operational control va bot fit. Muc tieu
          cua campaign nay la giu <strong>one gate, one prompt</strong> va dua prompt len it nhat muc{" "}
          <strong>Good</strong>.
        </p>

        <div className="form-grid" style={{ marginTop: "22px" }}>
          <Field label="Target bot" htmlFor="bot">
            <SelectField
              id="bot"
              value={selectedBot}
              onChange={(event) => setSelectedBot(event.target.value)}
            >
              <option value="linux_main">linux_main</option>
              <option value="lavis_linux">lavis_linux</option>
              <option value="gaubot">gaubot</option>
            </SelectField>
          </Field>

          <Field label="Prompt" htmlFor="prompt">
            <PromptTextarea
              id="prompt"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
            />
          </Field>

          <div className="detail-actions">
            <Button variant="primary" onClick={handleEvaluate} disabled={busy}>
              {busy ? "Evaluating..." : "Evaluate prompt"}
            </Button>
            <Button variant="ghost" onClick={() => loadExample("executor")}>
              Load executor example
            </Button>
          </div>
          <p className="status-message">{status}</p>
        </div>
      </Surface>

      <StickyAside>
        <Surface as="section" variant="tool">
          <p className="micro-label">Examples</p>
          <div className="list-stack">
            {starterPrompts.map((example) => (
              <Button
                key={example.id}
                variant="secondary"
                onClick={() => loadExample(example.id)}
              >
                {example.label}
              </Button>
            ))}
          </div>
        </Surface>

        <Surface as="section" variant="tool">
          <p className="micro-label">Rubric</p>
          <ul className="list-copy">
            <li>Clarity: co Codex directive, repo va gate goal ro rang khong</li>
            <li>Context safety: co noi ro issue moi / issue cu hay khong</li>
            <li>Operational control: co stop rule nhu checkpoint verdict hay candidate summary khong</li>
            <li>Bot fit: task text co hop linux_main, lavis_linux hay gaubot khong</li>
          </ul>
        </Surface>

        {evaluation ? (
          <Surface as="section" variant="tool">
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

            <div
              className="tool-card"
              style={{ marginTop: "14px", padding: 0, border: "none", background: "transparent" }}
            >
              <p className="micro-label">System interpretation</p>
              <p className="muted-copy" style={{ marginTop: "8px" }}>
                {evaluation.systemInterpretation}
              </p>
              <div className="suggestion-list">
                {evaluation.rewriteSuggestions.map((suggestion) => (
                  <Surface key={suggestion} variant="timeline" data-tone="warn">
                    {suggestion}
                  </Surface>
                ))}
              </div>
              {(evaluation.band === "Good" || evaluation.band === "Excellent") && (
                <Button variant="primary" style={{ marginTop: "16px" }} onClick={handleSendReady}>
                  Mark stage complete
                </Button>
              )}
            </div>
          </Surface>
        ) : null}
      </StickyAside>
    </DetailPageLayout>
  );
}
