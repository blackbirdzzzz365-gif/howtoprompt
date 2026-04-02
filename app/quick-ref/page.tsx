import { QuickRefWallet } from "@/components/quick-ref-wallet";
import { PageSection } from "@/components/ui/layout";
import { quickRefs } from "@/lib/content";

export default function QuickRefPage() {
  return (
    <PageSection strong>
      <p className="eyebrow">Quick Ref Wallet</p>
      <h1 className="section-title">Copy-safe cards for daily dispatch va product loop gates</h1>
      <p className="section-copy">
        Quick ref chi mo khoa khi ban complete stage lien quan. Muc tieu la de ban quay lai dung nhanh, khong
        can doc lai full operator guide moi lan.
      </p>
      <div style={{ marginTop: "20px" }}>
        <QuickRefWallet items={quickRefs} />
      </div>
    </PageSection>
  );
}
