"use client";

import { useAcademyProgress } from "@/components/app-provider";
import { LinkButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Surface } from "@/components/ui/surface";
import type { Mission } from "@/lib/content-schema";

export function MissionMap({
  missions,
  compact = false,
}: {
  missions: Mission[];
  compact?: boolean;
}) {
  const { completedMissionSlugs, activePathSlug, hydrated } = useAcademyProgress();

  return (
    <div className="mission-grid" data-compact={compact}>
      {missions.map((mission) => {
        const complete = hydrated && completedMissionSlugs.includes(mission.slug);

        return (
          <Surface key={mission.slug} as="article" variant="interactive" className="mission-card" data-complete={complete}>
            <div className="chip-row">
              <Chip variant="accent">Stage {String(mission.order).padStart(2, "0")}</Chip>
              <Chip variant="outline">{mission.duration}</Chip>
              <Chip variant="outline">{mission.focus}</Chip>
              {complete ? <Chip variant="success">Cleared</Chip> : null}
            </div>
            <div className="stack-xs">
              <h3 className="mission-title">{mission.title}</h3>
              <p className="mission-summary">{mission.tagline}</p>
            </div>
            <p className="muted-copy">Outcome: {mission.outcome}</p>
            <div className="detail-actions">
              <LinkButton href={`/missions/${mission.slug}`} variant="secondary" size="sm">
                Enter mission
              </LinkButton>
              {mission.practiceMode === "prompt-lab" ? (
                <LinkButton href="/prompt-lab" variant="ghost" size="sm">
                  Practice gate
                </LinkButton>
              ) : (
                <LinkButton href={`/simulator?scenario=${mission.slug}`} variant="ghost" size="sm">
                  Run sim
                </LinkButton>
              )}
            </div>
            {hydrated && activePathSlug ? (
              <p className="micro-label">Active path: {activePathSlug}</p>
            ) : null}
          </Surface>
        );
      })}
    </div>
  );
}
