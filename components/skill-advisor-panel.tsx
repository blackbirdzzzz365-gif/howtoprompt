"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { localizeCategory } from "@/lib/skill-atlas-ui";

type AdvisorSkill = {
  slug: string;
  name: string;
  reason_vi: string;
  confidence: "cao" | "vừa" | "thấp";
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

export function SkillAdvisorPanel({
  catalogId,
  apiBasePath,
  detailBasePath,
}: {
  catalogId: SkillAtlasCatalogId;
  apiBasePath: string;
  detailBasePath: string;
}) {
  const storageScope = `skill-atlas-advisor:${catalogId}`;
  const catalog = getSkillAtlasCatalog(catalogId);
  const [apiKey, setApiKey] = useState("");
  const [resolvedModel, setResolvedModel] = useState("");
  const [need, setNeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AdvisorResponse | null>(null);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setProviderError("");

    try {
      const response = await fetch(`${apiBasePath}/advice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          need,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Không gọi được AI advisor.");
      }

      setResult(payload.response as AdvisorResponse);
      setShortlist(payload.shortlist as ShortlistItem[]);
      setResolvedModel(payload.model || "");
      setUsedFallback(Boolean(payload.usedFallback));
      setProviderError(payload.providerError || "");
      if (payload.model) {
        window.localStorage.setItem(getStorageKey(storageScope, "model"), payload.model);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không gọi được AI advisor.");
      setResult(null);
      setShortlist([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-card">
      <p className="micro-label">AI Skill Advisor</p>
      <h2 className="mission-title" style={{ marginTop: "8px" }}>
        Nhập mong muốn, AI sẽ gợi ý bộ skill nên dùng trong catalog này
      </h2>
      <p className="mission-summary" style={{ marginTop: "10px" }}>
        API key `chiasegpu` được lưu riêng cho khu vực này trong trình duyệt của bạn. Hệ thống sẽ tự chọn model phù hợp,
        bạn không cần nhập tay. Catalog đang xem là {catalog?.shortTitle ?? catalogId}.
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
          <span className="micro-label">Mong muốn của bạn</span>
          <textarea
            className="textarea-field"
            rows={7}
            placeholder="Ví dụ: Tôi muốn audit production cho social-listening-v3, dừng ở checkpoint verdict, rồi để tôi chốt contained-fix hay new-phase."
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            required
          />
        </label>

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? "Đang hỏi AI..." : "Hỏi AI advisor"}
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
              Đang hiển thị gợi ý fallback cục bộ do AI provider chưa phản hồi ổn định.
              {providerError ? ` Chi tiết: ${providerError}` : ""}
            </div>
          ) : null}

          <article className="detail-card">
            <p className="micro-label">Kết luận</p>
            <p className="mission-summary" style={{ marginTop: "10px" }}>
              {result.answer_vi}
            </p>
          </article>

          <article className="detail-card">
            <p className="micro-label">Skill gợi ý</p>
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
                      <Link href={`${detailBasePath}/${skill.slug}`} className="button-secondary">
                        Xem skill này
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">AI chưa chốt được skill rõ ràng. Hãy nói yêu cầu cụ thể hơn.</div>
              )}
            </div>
          </article>

          {result.follow_up_vi ? (
            <article className="detail-card">
              <p className="micro-label">Prompt tiếp theo</p>
              <p className="mission-summary" style={{ marginTop: "10px" }}>
                {result.follow_up_vi}
              </p>
            </article>
          ) : null}

          {result.notes_vi?.length ? (
            <article className="detail-card">
              <p className="micro-label">Lưu ý</p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {result.notes_vi.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {shortlist.length > 0 ? (
            <article className="detail-card">
              <p className="micro-label">Shortlist local trước khi gọi AI</p>
              <div className="list-stack" style={{ marginTop: "10px" }}>
                {shortlist.map((entry) => (
                  <div key={entry.slug} className="outline-row">
                    <div>
                      <strong>{entry.name}</strong>
                      <p className="muted-copy">{localizeCategory(entry.category)}</p>
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

function getStorageKey(scope: string, field: string) {
  return `skill-atlas:${scope}:${field}`;
}
