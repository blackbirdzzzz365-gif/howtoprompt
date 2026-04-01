"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";

type ExplainResponse = {
  overview_vi: string;
  when_to_use_vi: string[];
  workflow_vi: string[];
  guardrails_vi: string[];
  related_skills_vi: string;
  example_prompts_vi: string[];
};

export function SkillExplainPanel({
  catalogId,
  apiBasePath,
  skillSlug,
}: {
  catalogId: SkillAtlasCatalogId;
  apiBasePath: string;
  skillSlug: string;
}) {
  const storageScope = `skill-explain:${catalogId}:${skillSlug}`;
  const catalog = getSkillAtlasCatalog(catalogId);
  const [apiKey, setApiKey] = useState("");
  const [resolvedModel, setResolvedModel] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [providerError, setProviderError] = useState("");

  useEffect(() => {
    const sectionApiKey = window.localStorage.getItem(getStorageKey(storageScope, "apiKey"));
    const legacyApiKey = window.localStorage.getItem("skill-atlas:chiasegpu-key");
    const sectionModel = window.localStorage.getItem(getStorageKey(storageScope, "model"));
    if (sectionApiKey || legacyApiKey) {
      setApiKey(sectionApiKey || legacyApiKey || "");
    }
    if (sectionModel) {
      setResolvedModel(sectionModel);
    }
  }, [storageScope]);

  useEffect(() => {
    if (apiKey) {
      window.localStorage.setItem(getStorageKey(storageScope, "apiKey"), apiKey);
    }
  }, [apiKey, storageScope]);

  async function handleExplain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setProviderError("");

    try {
      const response = await fetch(`${apiBasePath}/${skillSlug}/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          question,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Không gọi được AI explainer.");
      }

      setResult(payload.response as ExplainResponse);
      setResolvedModel(payload.model || "");
      setUsedFallback(Boolean(payload.usedFallback));
      setProviderError(payload.providerError || "");
      if (payload.model) {
        window.localStorage.setItem(getStorageKey(storageScope, "model"), payload.model);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không gọi được AI explainer.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-card">
      <p className="micro-label">AI Explain Mode</p>
      <h2 className="mission-title" style={{ marginTop: "8px" }}>
        Hỏi AI giải thích skill này bằng tiếng Việt
      </h2>
      <p className="mission-summary" style={{ marginTop: "10px" }}>
        AI sẽ đọc dữ liệu skill và referral docs đã sync vào DB rồi mới giải thích. API key được lưu riêng cho trang
        skill này trong trình duyệt của bạn. Catalog đang xem là {catalog?.shortTitle ?? catalogId}.
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
          <span className="micro-label">Câu hỏi thêm</span>
          <textarea
            className="textarea-field"
            rows={5}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ví dụ: giải thích cho tôi như một owner, skill này thực chất bắt agent làm gì, skill con nào nó hay gọi và vì sao?"
          />
        </label>

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? "Đang giải thích..." : "Hỏi AI về skill này"}
        </button>
      </form>

      <p className="muted-copy" style={{ marginTop: "12px" }}>
        {resolvedModel ? `Model đang dùng gần nhất: ${resolvedModel}` : "Model sẽ được tự nhận diện sau lần gọi đầu tiên."}
      </p>

      {error ? (
        <div className="empty-state" style={{ marginTop: "16px", borderStyle: "solid" }}>
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="list-stack" style={{ marginTop: "18px" }}>
          {usedFallback ? (
            <div className="empty-state">
              Đang hiển thị phần giải thích fallback cục bộ do AI provider chưa phản hồi ổn định.
              {providerError ? ` Chi tiết: ${providerError}` : ""}
            </div>
          ) : null}

          <article className="detail-card">
            <p className="micro-label">Tổng quan</p>
            <p className="mission-summary" style={{ marginTop: "10px" }}>
              {result.overview_vi}
            </p>
          </article>

          {result.when_to_use_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Khi nào nên dùng</p>
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
              <p className="micro-label">Skill liên quan</p>
              <p className="mission-summary" style={{ marginTop: "10px" }}>
                {result.related_skills_vi}
              </p>
            </article>
          ) : null}

          {result.example_prompts_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Prompt ví dụ</p>
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

function getStorageKey(scope: string, field: string) {
  return `skill-atlas:${scope}:${field}`;
}
