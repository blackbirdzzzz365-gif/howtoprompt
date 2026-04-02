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
      <Surface as="section" variant="hero" className="section-block stack-xl">
        <div className="stack-sm">
          <p className="eyebrow">Stage {String(mission.order).padStart(2, "0")}</p>
          <h1 className="section-title">{mission.title}</h1>
          <p className="section-copy">{mission.tagline}</p>
        </div>

        <div className="mission-meta">
          <Chip variant="accent">{mission.duration}</Chip>
          <Chip variant="outline">{mission.practiceMode}</Chip>
          <Chip variant="outline">{mission.focus}</Chip>
        </div>

        <DetailPairGrid>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Use when</p>
            <p className="mission-summary">{mission.useWhen}</p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Win condition</p>
            <p className="mission-summary">{mission.winCondition}</p>
          </Surface>
        </DetailPairGrid>

        <div className="list-stack">
          {mission.lessonBlocks.map((block) => (
            <Surface key={block.title} as="article" variant="subtle" className="stack-sm">
              <p className="micro-label">{block.title}</p>
              <p className="mission-summary">{block.body}</p>
              <ul className="list-copy">
                {block.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Surface>
          ))}
        </div>

        {mission.examplePrompts.length > 0 ? (
          <Surface variant="subtle" className="stack-md">
            <p className="micro-label">Command deck</p>
            <div className="list-stack">
              {mission.examplePrompts.map((example) => (
                <Surface key={example.label} as="article" variant="code" className="stack-xs">
                  <p className="micro-label">{example.label}</p>
                  <pre className="example-prompt">
                    <code>{example.prompt}</code>
                  </pre>
                </Surface>
              ))}
            </div>
          </Surface>
        ) : null}

        <Surface variant="subtle" className="stack-sm">
          <p className="micro-label">Evidence anchors</p>
          <ul className="list-copy">
            {mission.evidenceBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </Surface>
      </Surface>

      <StickyAside>
        <Surface as="section" variant="elevated" className="stack-md">
          <p className="micro-label">Unlocked quick ref</p>
          <div className="stack-xs">
            <h2 className="mission-title">{quickRef?.title}</h2>
            <p className="muted-copy">{quickRef?.summary}</p>
          </div>
          <div className="detail-actions">
            {mission.practiceMode === "prompt-lab" || mission.practiceMode === "mixed" ? (
              <LinkButton href="/prompt-lab" variant="primary" size="sm">
                Open Prompt Lab
              </LinkButton>
            ) : null}
            {mission.practiceMode === "simulator" || mission.practiceMode === "mixed" ? (
              <LinkButton
                href={`/simulator?scenario=${missionScenarios[0]?.id ?? mission.slug}`}
                variant="secondary"
                size="sm"
              >
                Run simulator
              </LinkButton>
            ) : null}
          </div>
        </Surface>

        <Surface as="section" variant="elevated" className="stack-sm">
          <p className="micro-label">Common traps</p>
          <ul className="list-copy">
            {mission.failureModes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Surface>

        <Surface as="section" variant="elevated" className="stack-sm">
          <p className="micro-label">Scenario deck</p>
          {missionScenarios.length > 0 ? (
            <div className="list-stack">
              {missionScenarios.map((scenario) => (
                <LinkButton key={scenario.id} href={`/simulator?scenario=${scenario.id}`} variant="secondary" size="sm">
                  {scenario.title}
                </LinkButton>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Stage nay nghiêng về command deck va Prompt Lab hon la simulator.
            </div>
          )}
        </Surface>

        <Surface as="section" variant="elevated" className="stack-sm">
          <p className="micro-label">Next stages</p>
          <MissionMap missions={relatedMissions} compact />
        </Surface>
      </StickyAside>
    </DetailPageLayout>
  );
}
