"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { SkillAdvisorPanel } from "@/components/skill-advisor-panel";
import { type SkillAtlasCatalog } from "@/lib/skill-atlas-catalogs";
import { formatRawBytes, localizeCategory, localizeSourceLabel } from "@/lib/skill-atlas-ui";

type SkillListItem = {
  slug: string;
  name: string;
  canonicalName: string;
  heading: string;
  sourceLabel: string;
  sourcePath: string;
  category: string;
  isAlias: boolean;
  summaryVi: string;
  triggerPhrases: string[];
  workflowHighlights: string[];
  guardrails: string[];
  rawBytes: number;
  relatedSkillNames: string[];
  relatedSkillSlugs: string[];
  referencedDocCount: number;
};

type SkillAtlasDirectoryProps = {
  catalog: SkillAtlasCatalog;
  catalogLinks: SkillAtlasCatalog[];
  generatedAt: string;
  skillCount: number;
  referenceCount: number;
  categories: string[];
  skills: SkillListItem[];
};

export function SkillAtlasDirectory({
  catalog,
  catalogLinks,
  generatedAt,
  skillCount,
  referenceCount,
  categories,
  skills,
}: SkillAtlasDirectoryProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const deferredQuery = useDeferredValue(query);

  const normalized = deferredQuery
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = activeCategory === "Tất cả" || skill.category === activeCategory;
    if (!matchesCategory) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = `${skill.name} ${skill.category} ${skill.summaryVi} ${skill.triggerPhrases.join(" ")} ${skill.relatedSkillNames.join(" ")}`
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  return (
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <p className="eyebrow">{catalog.eyebrow}</p>
        <h1 className="section-title">{catalog.title}</h1>
        <p className="section-copy">
          {catalog.description} Mỗi skill có tên, công dụng, trigger phrases, workflow, related skills, raw
          `SKILL.md`, và referral docs để bạn đọc lại hoặc hỏi AI.
        </p>

        <div className="detail-card" style={{ marginTop: "22px" }}>
          <p className="micro-label">Chuyển catalog</p>
          <div className="chip-row" style={{ marginTop: "12px" }}>
            {catalogLinks.map((item) => (
              <Link
                key={item.id}
                href={item.pagePath}
                className="nav-link"
                data-active={item.id === catalog.id}
              >
                {item.shortTitle}
              </Link>
            ))}
          </div>
        </div>

        <div className="stats-grid" style={{ marginTop: "22px" }}>
          <div className="stat-card">
            <p className="stat-label">Skills</p>
            <p className="stat-value">{skillCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Refs</p>
            <p className="stat-value">{referenceCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Snapshot</p>
            <p className="stat-value" style={{ fontSize: "1.15rem" }}>
              {new Date(generatedAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="detail-card" style={{ marginTop: "22px" }}>
          <p className="micro-label">Mô hình sync</p>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            Production site không đọc trực tiếp filesystem skill gốc. Vì vậy atlas này được sync thành JSON DB rồi
            mới deploy. {catalog.syncHint}
          </p>
        </div>

        <div className="atlas-toolbar" style={{ marginTop: "22px" }}>
          <label className="field-group atlas-search">
            <span className="micro-label">Tìm skill</span>
            <input
              className="input-field"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: production audit, phase executor, github, design system..."
            />
          </label>
          <div className="chip-row">
            <button
              type="button"
              className="nav-link"
              data-active={activeCategory === "Tất cả"}
              onClick={() => setActiveCategory("Tất cả")}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="nav-link"
                data-active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {localizeCategory(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="skill-grid" style={{ marginTop: "22px" }}>
          {filteredSkills.map((skill) => (
            <article key={skill.slug} className="skill-card">
              <div className="chip-row">
                <span className="chip">{localizeCategory(skill.category)}</span>
                {skill.isAlias ? <span className="outline-chip">alias</span> : null}
                <span className="outline-chip">{localizeSourceLabel(skill.sourceLabel)}</span>
              </div>

              <h2 className="mission-title" style={{ marginTop: "14px" }}>
                {skill.name}
              </h2>
              <p className="muted-copy" style={{ marginTop: "8px" }}>
                {skill.heading}
              </p>
              <p className="mission-summary" style={{ marginTop: "12px" }}>
                {skill.summaryVi}
              </p>

              <div className="tag-row" style={{ marginTop: "14px" }}>
                {skill.triggerPhrases.slice(0, 4).map((trigger) => (
                  <span key={trigger} className="outline-chip">
                    {trigger}
                  </span>
                ))}
              </div>

              <div className="list-stack" style={{ marginTop: "16px" }}>
                {skill.workflowHighlights.slice(0, 2).map((step) => (
                  <div key={step} className="outline-row">
                    <span className="signal-dot" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="outline-row" style={{ marginTop: "18px" }}>
                <span className="muted-copy">
                  {skill.referencedDocCount} refs • {skill.relatedSkillNames.length} related • {formatRawBytes(skill.rawBytes)}
                </span>
                <Link href={`${catalog.pagePath}/${skill.slug}`} className="button-secondary">
                  Mở chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredSkills.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "22px" }}>
            Không có skill nào khớp bộ lọc hiện tại.
          </div>
        ) : null}
      </section>

      <aside className="tool-stack">
        <SkillAdvisorPanel
          catalogId={catalog.id}
          apiBasePath={catalog.apiPath}
          detailBasePath={catalog.pagePath}
        />

        <section className="tool-card">
          <p className="micro-label">Cách học nhanh</p>
          <ul className="list-copy" style={{ marginTop: "12px" }}>
            <li>Bắt đầu từ skill list để nắm map tổng thể.</li>
            <li>Nếu bạn có tình huống cụ thể, hãy dùng AI advisor trước để shortlist.</li>
            <li>Vào trang chi tiết của từng skill để đọc workflow, guardrails, related skills và raw docs.</li>
            <li>Khi skill đổi, hãy sync snapshot mới rồi deploy lại để web không bị lệch thực tế.</li>
          </ul>
        </section>

        <section className="tool-card">
          <p className="micro-label">Quay lại arena</p>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            Nếu bạn muốn học theo game flow owner -&gt; bot -&gt; Codex -&gt; prod, hãy quay lại quest board chính.
          </p>
          <div className="detail-actions" style={{ marginTop: "16px" }}>
            <Link href="/social-listening-arena" className="button-primary">
              Quay lại SL Arena
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
