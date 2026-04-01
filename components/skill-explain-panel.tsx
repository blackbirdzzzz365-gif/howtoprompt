"use client";

import { useEffect, useState, type FormEvent } from "react";

type ExplainResponse = {
  overview_vi: string;
  when_to_use_vi: string[];
  workflow_vi: string[];
  guardrails_vi: string[];
  related_skills_vi: string;
  example_prompts_vi: string[];
};

const storageKeys = {
  apiKey: "skill-atlas:chiasegpu-key",
  model: "skill-atlas:chiasegpu-model",
};

export function SkillExplainPanel({ skillSlug }: { skillSlug: string }) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExplainResponse | null>(null);

  useEffect(() => {
    const savedApiKey = window.localStorage.getItem(storageKeys.apiKey);
    const savedModel = window.localStorage.getItem(storageKeys.model);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedModel) {
      setModel(savedModel);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      window.localStorage.setItem(storageKeys.apiKey, apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (model) {
      window.localStorage.setItem(storageKeys.model, model);
    }
  }, [model]);

  async function handleExplain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/skill-atlas/${skillSlug}/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          model,
          question,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Khong goi duoc AI explainer.");
      }

      setResult(payload.response as ExplainResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Khong goi duoc AI explainer.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-card sticky-console">
      <p className="micro-label">AI Explain Mode</p>
      <h2 className="mission-title" style={{ marginTop: "8px" }}>
        Hoi AI giai thich skill nay bang tieng Viet
      </h2>
      <p className="mission-summary" style={{ marginTop: "10px" }}>
        AI se doc raw `SKILL.md` va referral docs da sync vao DB roi moi giai thich.
      </p>

      <form className="list-stack" style={{ marginTop: "16px" }} onSubmit={handleExplain}>
        <label className="field-group">
          <span className="micro-label">ChiaseGPU API key</span>
          <input
            className="input-field"
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-..."
            required
          />
        </label>

        <label className="field-group">
          <span className="micro-label">Model</span>
          <input
            className="input-field"
            type="text"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="gpt-4.1-mini"
          />
        </label>

        <label className="field-group">
          <span className="micro-label">Cau hoi them</span>
          <textarea
            className="textarea-field"
            rows={5}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Vi du: giai thich cho toi nhu mot owner, skill nay thuc chat bat agent lam gi, skill con nao no hay goi va vi sao?"
          />
        </label>

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? "Dang giai thich..." : "Hoi AI ve skill nay"}
        </button>
      </form>

      {error ? (
        <div className="empty-state" style={{ marginTop: "16px", borderStyle: "solid" }}>
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="list-stack" style={{ marginTop: "18px" }}>
          <article className="detail-card">
            <p className="micro-label">Tong quan</p>
            <p className="mission-summary" style={{ marginTop: "10px" }}>
              {result.overview_vi}
            </p>
          </article>

          {result.when_to_use_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Khi nao nen dung</p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {result.when_to_use_vi.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {result.workflow_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Workflow</p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {result.workflow_vi.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {result.guardrails_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Guardrails</p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {result.guardrails_vi.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {result.related_skills_vi ? (
            <article className="detail-card">
              <p className="micro-label">Related skills</p>
              <p className="mission-summary" style={{ marginTop: "10px" }}>
                {result.related_skills_vi}
              </p>
            </article>
          ) : null}

          {result.example_prompts_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Prompt vi du</p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {result.example_prompts_vi.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
