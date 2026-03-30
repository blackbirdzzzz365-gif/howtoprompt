import Link from "next/link";
import { notFound } from "next/navigation";
import { MissionMap } from "@/components/mission-map";
import { getMission, getQuickRef, getScenariosForMission, missions } from "@/lib/content";

export function generateStaticParams() {
  return missions.map((mission) => ({ slug: mission.slug }));
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = getMission(slug);
  if (!mission) {
    notFound();
  }

  const quickRef = getQuickRef(mission.quickRefId);
  const missionScenarios = getScenariosForMission(mission.slug);

  return (
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <p className="eyebrow">Mission {String(mission.order).padStart(2, "0")}</p>
        <h1 className="section-title">{mission.title}</h1>
        <p className="section-copy">{mission.tagline}</p>

        <div className="mission-meta" style={{ marginTop: "16px" }}>
          <span className="chip">{mission.duration}</span>
          <span className="outline-chip">{mission.practiceMode}</span>
          <span className="outline-chip">{mission.focus}</span>
        </div>

        <div className="list-stack" style={{ marginTop: "22px" }}>
          {mission.lessonBlocks.map((block) => (
            <article key={block.title} className="detail-card">
              <p className="micro-label">{block.title}</p>
              <p className="mission-summary" style={{ marginTop: "8px" }}>
                {block.body}
              </p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {block.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="detail-card" style={{ marginTop: "18px" }}>
          <p className="micro-label">Evidence anchors</p>
          <ul className="list-copy" style={{ marginTop: "10px" }}>
            {mission.evidenceBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="tool-stack sticky-console">
        <section className="tool-card">
          <p className="micro-label">Unlocked quick ref</p>
          <h2 className="mission-title" style={{ marginTop: "6px" }}>
            {quickRef?.title}
          </h2>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            {quickRef?.summary}
          </p>
          <div className="detail-actions" style={{ marginTop: "16px" }}>
            {mission.practiceMode === "prompt-lab" || mission.practiceMode === "mixed" ? (
              <Link href="/prompt-lab" className="button-primary">
                Open Prompt Lab
              </Link>
            ) : null}
            {mission.practiceMode === "simulator" || mission.practiceMode === "mixed" ? (
              <Link
                href={`/simulator?scenario=${missionScenarios[0]?.id ?? mission.slug}`}
                className="button-secondary"
              >
                Run simulator
              </Link>
            ) : null}
          </div>
        </section>

        <section className="tool-card">
          <p className="micro-label">Related mission cards</p>
          <MissionMap missions={missions.filter((item) => item.order !== mission.order).slice(0, 2)} compact />
        </section>
      </aside>
    </div>
  );
}
