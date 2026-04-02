import { LinkButton } from "@/components/ui/button";
import { PageSection } from "@/components/ui/layout";

export default function NotFound() {
  return (
    <PageSection strong>
      <p className="eyebrow">404</p>
      <h1 className="section-title">Stage khong ton tai</h1>
      <p className="section-copy">Quay lai stage map de chon dung bai hoac tiep tuc Prompt Lab.</p>
      <div className="hero-actions" style={{ marginTop: "18px" }}>
        <LinkButton href="/missions" variant="primary">
          Stage map
        </LinkButton>
        <LinkButton href="/prompt-lab" variant="secondary">
          Prompt Lab
        </LinkButton>
      </div>
    </PageSection>
  );
}
