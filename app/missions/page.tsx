import { MissionMap } from "@/components/mission-map";
import { missions } from "@/lib/content";

export default function MissionsPage() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">Mission map</p>
      <h1 className="section-title">Six missions tied directly to the guide</h1>
      <p className="section-copy">
        Day la phien ban website cua 15 section trong guide goc, duoc dong lai thanh 6 mission co the hoc,
        practice va unlock quick refs.
      </p>
      <MissionMap missions={missions} />
    </section>
  );
}
