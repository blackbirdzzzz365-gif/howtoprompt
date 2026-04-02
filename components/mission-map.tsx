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
          <Surface key={mission.slug} as="article" variant="mission" data-complete={complete}>
            <div className="chip-row">
              <Chip>Stage {String(mission.order).padStart(2, "0")}</Chip>
              <Chip variant="outline">{mission.duration}</Chip>
              <Chip variant="outline">{mission.focus}</Chip>
              {complete ? <Chip variant="status">Cleared</Chip> : null}
            </div>
            <h3 className="mission-title" style={{ marginTop: "14px" }}>
              {mission.title}
            </h3>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {mission.tagline}
            </p>
            <p className="muted-copy" style={{ marginTop: "12px" }}>
              Outcome: {mission.outcome}
            </p>
            <div className="detail-actions" style={{ marginTop: "18px" }}>
              <LinkButton href={`/missions/${mission.slug}`} variant="secondary">
                Enter mission
              </LinkButton>
              {mission.practiceMode === "prompt-lab" ? (
                <LinkButton href="/prompt-lab" variant="ghost">
                  Practice gate
                </LinkButton>
              ) : (
                <LinkButton href={`/simulator?scenario=${mission.slug}`} variant="ghost">
                  Run sim
                </LinkButton>
              )}
            </div>
            {hydrated && activePathSlug ? (
              <p className="micro-label" style={{ marginTop: "14px" }}>
                Active path: {activePathSlug}
              </p>
            ) : null}
          </Surface>
        );
      })}
    </div>
  );
}
