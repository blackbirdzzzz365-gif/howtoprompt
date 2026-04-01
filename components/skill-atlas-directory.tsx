"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { SkillAdvisorPanel } from "@/components/skill-advisor-panel";

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
  generatedAt: string;
  skillCount: number;
  referenceCount: number;
  categories: string[];
  skills: SkillListItem[];
};

function formatRawBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SkillAtlasDirectory({
  generatedAt,
  skillCount,
  referenceCount,
  categories,
  skills,
}: SkillAtlasDirectoryProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tat ca");
  const deferredQuery = useDeferredValue(query);

  const normalized = deferredQuery
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = activeCategory === "Tat ca" || skill.category === activeCategory;
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
        <p className="eyebrow">SL Arena / Skill Atlas</p>
        <h1 className="section-title">Kho skill Codex + referral docs da duoc sync vao app</h1>
        <p className="section-copy">
          Day la catalog da snapshot tu may cua ban. Moi skill co ten, cong dung, trigger phrases, workflow,
          related skills, raw `SKILL.md`, va referral docs de ban doc lai hoac hoi AI.
        </p>

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
          <p className="micro-label">Sync model</p>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            Production site khong doc truc tiep filesystem skill tren may Mac cua ban. Vi vay atlas nay duoc sync
            thanh JSON DB roi moi deploy. Luc skill doi, ban chi can yeu cau Codex rerun `pnpm sync:skills`, review
            diff, roi deploy lai site.
          </p>
        </div>

        <div className="atlas-toolbar" style={{ marginTop: "22px" }}>
          <label className="field-group atlas-search">
            <span className="micro-label">Tim skill</span>
            <input
              className="input-field"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Vi du: production audit, phase executor, github, design system..."
            />
          </label>
          <div className="chip-row">
            <button
              type="button"
              className="nav-link"
              data-active={activeCategory === "Tat ca"}
              onClick={() => setActiveCategory("Tat ca")}
            >
              Tat ca
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="nav-link"
                data-active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="skill-grid" style={{ marginTop: "22px" }}>
          {filteredSkills.map((skill) => (
            <article key={skill.slug} className="skill-card">
              <div className="chip-row">
                <span className="chip">{skill.category}</span>
                {skill.isAlias ? <span className="outline-chip">alias</span> : null}
                <span className="outline-chip">{skill.sourceLabel}</span>
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
                <Link href={`/social-listening-arena/skills/${skill.slug}`} className="button-secondary">
                  Mo chi tiet
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredSkills.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "22px" }}>
            Khong co skill nao khop bo loc hien tai.
          </div>
        ) : null}
      </section>

      <aside className="tool-stack">
        <SkillAdvisorPanel />

        <section className="tool-card">
          <p className="micro-label">Cach hoc nhanh</p>
          <ul className="list-copy" style={{ marginTop: "12px" }}>
            <li>Bat dau tu skill list de biet map tong the.</li>
            <li>Neu ban co tinh huong cu the, dung AI advisor truoc de shortlist.</li>
            <li>Vao trang chi tiet cua tung skill de doc workflow, guardrails, related skills, va raw docs.</li>
            <li>Khi skill doi, sync snapshot moi roi deploy lai de web khong bi lech thuc te.</li>
          </ul>
        </section>

        <section className="tool-card">
          <p className="micro-label">Back to arena</p>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            Neu ban muon hoc theo game flow owner -&gt; bot -&gt; Codex -&gt; prod, quay lai quest board chinh.
          </p>
          <div className="detail-actions" style={{ marginTop: "16px" }}>
            <Link href="/social-listening-arena" className="button-primary">
              Quay lai SL Arena
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
