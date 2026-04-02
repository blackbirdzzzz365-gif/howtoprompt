import { SkillExplainPanel } from "@/components/skill-explain-panel";
import { LinkButton, buttonClassName } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { DetailPageLayout, DetailPairGrid, StickyAside } from "@/components/ui/layout";
import { Surface } from "@/components/ui/surface";
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
    <DetailPageLayout>
      <Surface as="section" variant="panelStrong" className="section-block">
        <div className="detail-actions">
          <LinkButton href={catalog.pagePath} variant="ghost">
            Quay lại {catalog.shortTitle}
          </LinkButton>
          <a
            href={`${catalog.apiPath}/${skill.slug}/raw?ref=skill`}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName("secondary")}
          >
            Raw SKILL.md
          </a>
        </div>

        <p className="eyebrow" style={{ marginTop: "18px" }}>
          {catalog.eyebrow} / Skill Detail
        </p>
        <h1 className="section-title">{skill.name}</h1>
        <p className="section-copy">{skill.summaryVi}</p>

        <Surface variant="detail" style={{ marginTop: "18px" }}>
          <p className="micro-label">Chuyển catalog</p>
          <div className="chip-row" style={{ marginTop: "12px" }}>
            {catalogLinks.map((item) => (
              <LinkButton
                key={item.id}
                href={item.pagePath}
                variant="nav"
                data-active={item.id === catalog.id}
              >
                {item.shortTitle}
              </LinkButton>
            ))}
          </div>
        </Surface>

        <div className="mission-meta" style={{ marginTop: "16px" }}>
          <Chip>{localizeCategory(skill.category)}</Chip>
          <Chip variant="outline">{localizeSourceLabel(skill.sourceLabel)}</Chip>
          <Chip variant="outline">{formatRawBytes(skill.rawBytes)}</Chip>
          <Chip variant="outline">{skill.referencedDocs.length} refs</Chip>
        </div>

        <DetailPairGrid style={{ marginTop: "22px" }}>
          <Surface as="article" variant="detail">
            <p className="micro-label">Tiêu đề</p>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {skill.heading}
            </p>
          </Surface>
          <Surface as="article" variant="detail">
            <p className="micro-label">Đường dẫn nguồn</p>
            <p className="mono-path" style={{ marginTop: "8px" }}>
              {skill.sourcePath}
            </p>
          </Surface>
        </DetailPairGrid>

        {skill.triggerPhrases.length ? (
          <Surface as="article" variant="detail" style={{ marginTop: "18px" }}>
            <p className="micro-label">Trigger phrases</p>
            <div className="tag-row" style={{ marginTop: "12px" }}>
              {skill.triggerPhrases.map((trigger) => (
                <Chip key={trigger} variant="outline">
                  {trigger}
                </Chip>
              ))}
            </div>
          </Surface>
        ) : null}

        {skill.workflowHighlights.length ? (
          <Surface as="article" variant="detail" style={{ marginTop: "18px" }}>
            <p className="micro-label">Các bước chính</p>
            <ul className="list-copy" style={{ marginTop: "10px" }}>
              {skill.workflowHighlights.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </Surface>
        ) : null}

        {skill.guardrails.length ? (
          <Surface as="article" variant="detail" style={{ marginTop: "18px" }}>
            <p className="micro-label">Guardrails</p>
            <ul className="list-copy" style={{ marginTop: "10px" }}>
              {skill.guardrails.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </Surface>
        ) : null}

        {skill.sections.length ? (
          <Surface as="article" variant="detail" style={{ marginTop: "18px" }}>
            <p className="micro-label">Các mục được tóm tắt</p>
            <div className="list-stack" style={{ marginTop: "12px" }}>
              {skill.sections.map((section) => (
                <Surface key={section.title} variant="reference">
                  <strong>{section.title}</strong>
                  <p className="mission-summary" style={{ marginTop: "8px" }}>
                    {section.body}
                  </p>
                </Surface>
              ))}
            </div>
          </Surface>
        ) : null}

        <Surface as="article" variant="detail" style={{ marginTop: "18px" }}>
          <p className="micro-label">Referral docs</p>
          <div className="list-stack" style={{ marginTop: "12px" }}>
            {skill.referencedDocs.length > 0 ? (
              skill.referencedDocs.map((doc) => (
                <Surface key={doc.id} variant="reference">
                  <div className="chip-row">
                    <Chip>{doc.exists ? "đã resolve" : "chưa resolve"}</Chip>
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
                        className={buttonClassName("secondary")}
                      >
                        Mở raw doc
                      </a>
                    </div>
                  ) : null}
                </Surface>
              ))
            ) : (
              <div className="empty-state">Skill này không có referral doc đã được sync.</div>
            )}
          </div>
        </Surface>

        <Surface as="article" variant="detail" style={{ marginTop: "18px" }}>
          <p className="micro-label">Xem nhanh raw</p>
          <pre className="example-prompt" style={{ marginTop: "10px", maxHeight: "360px" }}>
            <code>{skill.raw}</code>
          </pre>
        </Surface>
      </Surface>

      <StickyAside className="tool-stack">
        <SkillExplainPanel catalogId={catalog.id} apiBasePath={catalog.apiPath} skillSlug={skill.slug} />

        <Surface as="section" variant="tool">
          <p className="micro-label">Skill liên quan</p>
          <div className="list-stack" style={{ marginTop: "12px" }}>
            {skill.relatedSkillSlugs.length > 0 ? (
              skill.relatedSkillSlugs.map((relatedSlug, index) => (
                <LinkButton
                  key={relatedSlug}
                  href={`${catalog.pagePath}/${relatedSlug}`}
                  variant="secondary"
                >
                  {skill.relatedSkillNames[index]}
                </LinkButton>
              ))
            ) : (
              <div className="empty-state">Skill này chưa có related skill được map từ raw docs.</div>
            )}
          </div>
        </Surface>

        <Surface as="section" variant="tool">
          <p className="micro-label">Tất cả source paths</p>
          <ul className="list-copy" style={{ marginTop: "12px" }}>
            {skill.allSourcePaths.map((item) => (
              <li key={item}>
                <span className="mono-path">{item}</span>
              </li>
            ))}
          </ul>
        </Surface>
      </StickyAside>
    </DetailPageLayout>
  );
}
