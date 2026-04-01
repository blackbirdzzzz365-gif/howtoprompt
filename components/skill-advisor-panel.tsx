"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type AdvisorSkill = {
  slug: string;
  name: string;
  reason_vi: string;
  confidence: "cao" | "vua" | "thap";
};

type AdvisorResponse = {
  answer_vi: string;
  recommended_skills: AdvisorSkill[];
  follow_up_vi: string;
  notes_vi: string[];
};

type ShortlistItem = {
  slug: string;
  name: string;
  score: number;
  category: string;
};

const storageKeys = {
  apiKey: "skill-atlas:chiasegpu-key",
  model: "skill-atlas:chiasegpu-model",
};

export function SkillAdvisorPanel() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [need, setNeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AdvisorResponse | null>(null);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/skill-atlas/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          model,
          need,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Khong goi duoc AI advisor.");
      }

      setResult(payload.response as AdvisorResponse);
      setShortlist(payload.shortlist as ShortlistItem[]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Khong goi duoc AI advisor.");
      setResult(null);
      setShortlist([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-card sticky-console">
      <p className="micro-label">AI Skill Advisor</p>
      <h2 className="mission-title" style={{ marginTop: "8px" }}>
        Nhap mong muon, AI se goi y bo skill nen dung
      </h2>
      <p className="mission-summary" style={{ marginTop: "10px" }}>
        Key `chiasegpu` duoc nhap truc tiep tren web va chi luu trong local storage cua trinh duyet nay.
      </p>

      <form className="list-stack" style={{ marginTop: "16px" }} onSubmit={handleSubmit}>
        <label className="field-group">
          <span className="micro-label">ChiaseGPU API key</span>
          <input
            className="input-field"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            required
          />
        </label>

        <label className="field-group">
          <span className="micro-label">Model</span>
          <input
            className="input-field"
            type="text"
            placeholder="gpt-4.1-mini"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
        </label>

        <label className="field-group">
          <span className="micro-label">Mong muon cua ban</span>
          <textarea
            className="textarea-field"
            rows={7}
            placeholder="Vi du: Toi muon audit production cho social-listening-v3, dung o checkpoint verdict, roi de toi chot contained-fix hay new-phase."
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            required
          />
        </label>

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? "Dang hoi AI..." : "Hoi AI advisor"}
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
            <p className="micro-label">Ket luan</p>
            <p className="mission-summary" style={{ marginTop: "10px" }}>
              {result.answer_vi}
            </p>
          </article>

          <article className="detail-card">
            <p className="micro-label">Skill goi y</p>
            <div className="list-stack" style={{ marginTop: "12px" }}>
              {result.recommended_skills.length > 0 ? (
                result.recommended_skills.map((skill) => (
                  <div key={skill.slug} className="reference-card">
                    <div className="chip-row">
                      <span className="chip">{skill.confidence}</span>
                      <strong>{skill.name}</strong>
                    </div>
                    <p className="mission-summary" style={{ marginTop: "10px" }}>
                      {skill.reason_vi}
                    </p>
                    <div className="detail-actions" style={{ marginTop: "14px" }}>
                      <Link href={`/social-listening-arena/skills/${skill.slug}`} className="button-secondary">
                        Xem skill nay
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">AI chua chot duoc skill ro rang. Hay noi yeu cau cu the hon.</div>
              )}
            </div>
          </article>

          {result.follow_up_vi ? (
            <article className="detail-card">
              <p className="micro-label">Prompt tiep theo</p>
              <p className="mission-summary" style={{ marginTop: "10px" }}>
                {result.follow_up_vi}
              </p>
            </article>
          ) : null}

          {result.notes_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Luu y</p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {result.notes_vi.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {shortlist.length > 0 ? (
            <article className="detail-card">
              <p className="micro-label">Local shortlist truoc khi goi AI</p>
              <div className="list-stack" style={{ marginTop: "10px" }}>
                {shortlist.map((entry) => (
                  <div key={entry.slug} className="outline-row">
                    <div>
                      <strong>{entry.name}</strong>
                      <p className="muted-copy">{entry.category}</p>
                    </div>
                    <span className="outline-chip">score {entry.score}</span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
