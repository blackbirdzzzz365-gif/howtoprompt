import { MissionMap } from "@/components/mission-map";
import { PageSection } from "@/components/ui/layout";
import { missions } from "@/lib/content";

export default function MissionsPage() {
  return (
    <PageSection strong className="stack-lg">
      <div className="stack-sm">
        <p className="eyebrow">Mission map</p>
        <h1 className="section-title">Six stages tied directly to the real product loop</h1>
        <p className="section-copy">
          Đây là phiên bản website của operator playbook gốc, được đóng lại thành 6 stage có thể học, practice,
          unlock quick refs và đi theo đúng 2 human gate của workflow.
        </p>
      </div>
      <MissionMap missions={missions} />
    </PageSection>
  );
}
