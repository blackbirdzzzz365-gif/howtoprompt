import { MissionMap } from "@/components/mission-map";
import { LinkButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { DetailPageLayout, DetailPairGrid, StickyAside } from "@/components/ui/layout";
import { Surface } from "@/components/ui/surface";
import type { Mission, QuickRef, Scenario } from "@/lib/content-schema";

export function MissionDetailView({
  mission,
  quickRef,
  missionScenarios,
  relatedMissions,
}: {
  mission: Mission;
  quickRef: QuickRef | undefined;
  missionScenarios: Scenario[];
  relatedMissions: Mission[];
}) {
  return (
    <DetailPageLayout>
      <Surface as="section" variant="panelStrong" className="section-block">
        <p className="eyebrow">Stage {String(mission.order).padStart(2, "0")}</p>
        <h1 className="section-title">{mission.title}</h1>
        <p className="section-copy">{mission.tagline}</p>

        <div className="mission-meta" style={{ marginTop: "16px" }}>
          <Chip>{mission.duration}</Chip>
          <Chip variant="outline">{mission.practiceMode}</Chip>
          <Chip variant="outline">{mission.focus}</Chip>
        </div>

        <DetailPairGrid style={{ marginTop: "22px" }}>
          <Surface as="article" variant="detail">
            <p className="micro-label">Use when</p>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {mission.useWhen}
            </p>
          </Surface>
          <Surface as="article" variant="detail">
            <p className="micro-label">Win condition</p>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {mission.winCondition}
            </p>
          </Surface>
        </DetailPairGrid>

        <div className="list-stack" style={{ marginTop: "22px" }}>
          {mission.lessonBlocks.map((block) => (
            <Surface key={block.title} as="article" variant="detail">
              <p className="micro-label">{block.title}</p>
              <p className="mission-summary" style={{ marginTop: "8px" }}>
                {block.body}
              </p>
              <ul className="list-copy" style={{ marginTop: "10px" }}>
                {block.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Surface>
          ))}
        </div>

        {mission.examplePrompts.length > 0 ? (
          <Surface variant="detail" style={{ marginTop: "18px" }}>
            <p className="micro-label">Command deck</p>
            <div className="list-stack" style={{ marginTop: "14px" }}>
              {mission.examplePrompts.map((example) => (
                <Surface key={example.label} as="article" variant="prompt">
                  <p className="micro-label">{example.label}</p>
                  <pre className="example-prompt" style={{ marginTop: "10px" }}>
                    <code>{example.prompt}</code>
                  </pre>
                </Surface>
              ))}
            </div>
          </Surface>
        ) : null}

        <Surface variant="detail" style={{ marginTop: "18px" }}>
          <p className="micro-label">Evidence anchors</p>
          <ul className="list-copy" style={{ marginTop: "10px" }}>
            {mission.evidenceBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </Surface>
      </Surface>

      <StickyAside>
        <Surface as="section" variant="tool">
          <p className="micro-label">Unlocked quick ref</p>
          <h2 className="mission-title" style={{ marginTop: "6px" }}>
            {quickRef?.title}
          </h2>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            {quickRef?.summary}
          </p>
          <div className="detail-actions" style={{ marginTop: "16px" }}>
            {mission.practiceMode === "prompt-lab" || mission.practiceMode === "mixed" ? (
              <LinkButton href="/prompt-lab" variant="primary">
                Open Prompt Lab
              </LinkButton>
            ) : null}
            {mission.practiceMode === "simulator" || mission.practiceMode === "mixed" ? (
              <LinkButton
                href={`/simulator?scenario=${missionScenarios[0]?.id ?? mission.slug}`}
                variant="secondary"
              >
                Run simulator
              </LinkButton>
            ) : null}
          </div>
        </Surface>

        <Surface as="section" variant="tool">
          <p className="micro-label">Common traps</p>
          <ul className="list-copy" style={{ marginTop: "12px" }}>
            {mission.failureModes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Surface>

        <Surface as="section" variant="tool">
          <p className="micro-label">Scenario deck</p>
          {missionScenarios.length > 0 ? (
            <div className="list-stack" style={{ marginTop: "14px" }}>
              {missionScenarios.map((scenario) => (
                <LinkButton key={scenario.id} href={`/simulator?scenario=${scenario.id}`} variant="secondary">
                  {scenario.title}
                </LinkButton>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: "14px" }}>
              Stage nay nghiêng về command deck va Prompt Lab hon la simulator.
            </div>
          )}
        </Surface>

        <Surface as="section" variant="tool">
          <p className="micro-label">Next stages</p>
          <MissionMap missions={relatedMissions} compact />
        </Surface>
      </StickyAside>
    </DetailPageLayout>
  );
}
