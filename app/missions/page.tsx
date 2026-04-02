import { MissionMap } from "@/components/mission-map";
import { PageSection } from "@/components/ui/layout";
import { missions } from "@/lib/content";

export default function MissionsPage() {
  return (
    <PageSection strong>
      <p className="eyebrow">Mission map</p>
      <h1 className="section-title">Six stages tied directly to the real product loop</h1>
      <p className="section-copy">
        Day la phien ban website cua operator playbook goc, duoc dong lai thanh 6 stage co the hoc, practice,
        unlock quick refs va di theo dung 2 human gate cua workflow.
      </p>
      <MissionMap missions={missions} />
    </PageSection>
  );
}
