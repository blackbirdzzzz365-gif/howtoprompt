import Link from "next/link";
import { SkillExplainPanel } from "@/components/skill-explain-panel";
import { type SkillAtlasCatalog } from "@/lib/skill-atlas-catalogs";
import { type SkillAtlasSkill } from "@/lib/skill-atlas";
import { formatRawBytes, localizeCategory, localizeSourceLabel } from "@/lib/skill-atlas-ui";

export function SkillAtlasDetail({
  catalog,
  catalogLinks,
  skill,
}: {
  catalog: SkillAtlasCatalog;
  catalogLinks: SkillAtlasCatalog[];
  skill: SkillAtlasSkill;
}) {
  return (
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <div className="detail-actions">
          <Link href={catalog.pagePath} className="button-ghost">
            Quay lại {catalog.shortTitle}
          </Link>
          <a
            href={`${catalog.apiPath}/${skill.slug}/raw?ref=skill`}
            target="_blank"
            rel="noreferrer"
            className="button-secondary"
          >
            Raw SKILL.md
          </a>
        </div>

        <p className="eyebrow" style={{ marginTop: "18px" }}>
          {catalog.eyebrow} / Skill Detail
        </p>
        <h1 className="section-title">{skill.name}</h1>
        <p className="section-copy">{skill.summaryVi}</p>

        <div className="detail-card" style={{ marginTop: "18px" }}>
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

        <div className="mission-meta" style={{ marginTop: "16px" }}>
          <span className="chip">{localizeCategory(skill.category)}</span>
          <span className="outline-chip">{localizeSourceLabel(skill.sourceLabel)}</span>
          <span className="outline-chip">{formatRawBytes(skill.rawBytes)}</span>
          <span className="outline-chip">{skill.referencedDocs.length} refs</span>
        </div>

        <div className="detail-grid detail-grid-tight" style={{ marginTop: "22px" }}>
          <article className="detail-card">
            <p className="micro-label">Tiêu đề</p>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {skill.heading}
            </p>
          </article>
          <article className="detail-card">
            <p className="micro-label">Đường dẫn nguồn</p>
            <p className="mono-path" style={{ marginTop: "8px" }}>
              {skill.sourcePath}
            </p>
          </article>
        </div>

        {skill.triggerPhrases.length ? (
          <article className="detail-card" style={{ marginTop: "18px" }}>
            <p className="micro-label">Trigger phrases</p>
            <div className="tag-row" style={{ marginTop: "12px" }}>
              {skill.triggerPhrases.map((trigger) => (
                <span key={trigger} className="outline-chip">
                  {trigger}
                </span>
              ))}
            </div>
          </article>
        ) : null}

        {skill.workflowHighlights.length ? (
          <article className="detail-card" style={{ marginTop: "18px" }}>
            <p className="micro-label">Các bước chính</p>
            <ul className="list-copy" style={{ marginTop: "10px" }}>
              {skill.workflowHighlights.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </article>
        ) : null}

        {skill.guardrails.length ? (
          <article className="detail-card" style={{ marginTop: "18px" }}>
            <p className="micro-label">Guardrails</p>
            <ul className="list-copy" style={{ marginTop: "10px" }}>
              {skill.guardrails.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
        ) : null}

        {skill.sections.length ? (
          <article className="detail-card" style={{ marginTop: "18px" }}>
            <p className="micro-label">Các mục được tóm tắt</p>
            <div className="list-stack" style={{ marginTop: "12px" }}>
              {skill.sections.map((section) => (
                <div key={section.title} className="reference-card">
                  <strong>{section.title}</strong>
                  <p className="mission-summary" style={{ marginTop: "8px" }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        <article className="detail-card" style={{ marginTop: "18px" }}>
          <p className="micro-label">Referral docs</p>
          <div className="list-stack" style={{ marginTop: "12px" }}>
            {skill.referencedDocs.length > 0 ? (
              skill.referencedDocs.map((doc) => (
                <div key={doc.id} className="reference-card">
                  <div className="chip-row">
                    <span className="chip">{doc.exists ? "đã resolve" : "chưa resolve"}</span>
                    <strong>{doc.title}</strong>
                  </div>
                  <p className="mono-path" style={{ marginTop: "8px" }}>
                    {doc.label}
                  </p>
                  <p className="mission-summary" style={{ marginTop: "10px" }}>
                    {doc.excerpt || "Doc này mới được ghi nhận là path tham chiếu, chưa có nội dung để preview."}
                  </p>
                  {doc.raw ? (
                    <div className="detail-actions" style={{ marginTop: "14px" }}>
                      <a
                        href={`${catalog.apiPath}/${skill.slug}/raw?ref=${doc.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary"
                      >
                        Mở raw doc
                      </a>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty-state">Skill này không có referral doc đã được sync.</div>
            )}
          </div>
        </article>

        <article className="detail-card" style={{ marginTop: "18px" }}>
          <p className="micro-label">Xem nhanh raw</p>
          <pre className="example-prompt" style={{ marginTop: "10px", maxHeight: "360px" }}>
            <code>{skill.raw}</code>
          </pre>
        </article>
      </section>

      <aside className="tool-stack">
        <SkillExplainPanel catalogId={catalog.id} apiBasePath={catalog.apiPath} skillSlug={skill.slug} />

        <section className="tool-card">
          <p className="micro-label">Skill liên quan</p>
          <div className="list-stack" style={{ marginTop: "12px" }}>
            {skill.relatedSkillSlugs.length > 0 ? (
              skill.relatedSkillSlugs.map((relatedSlug, index) => (
                <Link
                  key={relatedSlug}
                  href={`${catalog.pagePath}/${relatedSlug}`}
                  className="button-secondary"
                >
                  {skill.relatedSkillNames[index]}
                </Link>
              ))
            ) : (
              <div className="empty-state">Skill này chưa có related skill được map từ raw docs.</div>
            )}
          </div>
        </section>

        <section className="tool-card">
          <p className="micro-label">Tất cả source paths</p>
          <ul className="list-copy" style={{ marginTop: "12px" }}>
            {skill.allSourcePaths.map((item) => (
              <li key={item}>
                <span className="mono-path">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
