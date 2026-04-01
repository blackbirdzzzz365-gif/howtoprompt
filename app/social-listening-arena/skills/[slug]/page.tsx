import Link from "next/link";
import { notFound } from "next/navigation";
import { SkillExplainPanel } from "@/components/skill-explain-panel";
import { getSkillAtlas, getSkillBySlug } from "@/lib/skill-atlas";

export async function generateStaticParams() {
  const atlas = await getSkillAtlas();
  return atlas.skills.map((skill) => ({ slug: skill.slug }));
}

function formatRawBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) {
    notFound();
  }

  return (
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <div className="detail-actions">
          <Link href="/social-listening-arena/skills" className="button-ghost">
            Back to Skill Atlas
          </Link>
          <a href={`/api/skill-atlas/${skill.slug}/raw?ref=skill`} target="_blank" rel="noreferrer" className="button-secondary">
            Raw SKILL.md
          </a>
        </div>

        <p className="eyebrow" style={{ marginTop: "18px" }}>
          SL Arena / Skill Detail
        </p>
        <h1 className="section-title">{skill.name}</h1>
        <p className="section-copy">{skill.summaryVi}</p>

        <div className="mission-meta" style={{ marginTop: "16px" }}>
          <span className="chip">{skill.category}</span>
          <span className="outline-chip">{skill.sourceLabel}</span>
          <span className="outline-chip">{formatRawBytes(skill.rawBytes)}</span>
          <span className="outline-chip">{skill.referencedDocs.length} refs</span>
        </div>

        <div className="detail-grid detail-grid-tight" style={{ marginTop: "22px" }}>
          <article className="detail-card">
            <p className="micro-label">Heading</p>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {skill.heading}
            </p>
          </article>
          <article className="detail-card">
            <p className="micro-label">Source path</p>
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
            <p className="micro-label">Workflow highlights</p>
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
            <p className="micro-label">Sections tom tat</p>
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
                    <span className="chip">{doc.exists ? "resolved" : "unresolved"}</span>
                    <strong>{doc.title}</strong>
                  </div>
                  <p className="mono-path" style={{ marginTop: "8px" }}>
                    {doc.label}
                  </p>
                  <p className="mission-summary" style={{ marginTop: "10px" }}>
                    {doc.excerpt || "Doc nay moi duoc ghi nhan la path tham chieu, chua co noi dung de preview."}
                  </p>
                  {doc.raw ? (
                    <div className="detail-actions" style={{ marginTop: "14px" }}>
                      <a
                        href={`/api/skill-atlas/${skill.slug}/raw?ref=${doc.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary"
                      >
                        Mo raw doc
                      </a>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty-state">Skill nay khong co referral doc duoc sync.</div>
            )}
          </div>
        </article>

        <article className="detail-card" style={{ marginTop: "18px" }}>
          <p className="micro-label">Raw preview</p>
          <pre className="example-prompt" style={{ marginTop: "10px", maxHeight: "360px" }}>
            <code>{skill.raw}</code>
          </pre>
        </article>
      </section>

      <aside className="tool-stack">
        <SkillExplainPanel skillSlug={skill.slug} />

        <section className="tool-card">
          <p className="micro-label">Related skills</p>
          <div className="list-stack" style={{ marginTop: "12px" }}>
            {skill.relatedSkillSlugs.length > 0 ? (
              skill.relatedSkillSlugs.map((relatedSlug, index) => (
                <Link
                  key={relatedSlug}
                  href={`/social-listening-arena/skills/${relatedSlug}`}
                  className="button-secondary"
                >
                  {skill.relatedSkillNames[index]}
                </Link>
              ))
            ) : (
              <div className="empty-state">Skill nay chua co related skill duoc map tu raw docs.</div>
            )}
          </div>
        </section>

        <section className="tool-card">
          <p className="micro-label">All source paths</p>
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
