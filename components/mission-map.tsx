"use client";

import Link from "next/link";
import { useAcademyProgress } from "@/components/app-provider";
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
          <article key={mission.slug} className="mission-card" data-complete={complete}>
            <div className="chip-row">
              <span className="chip">Stage {String(mission.order).padStart(2, "0")}</span>
              <span className="outline-chip">{mission.duration}</span>
              <span className="outline-chip">{mission.focus}</span>
              {complete ? <span className="status-chip">Cleared</span> : null}
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
              <Link href={`/missions/${mission.slug}`} className="button-secondary">
                Enter mission
              </Link>
              {mission.practiceMode === "prompt-lab" ? (
                <Link href="/prompt-lab" className="button-ghost">
                  Practice gate
                </Link>
              ) : (
                <Link href={`/simulator?scenario=${mission.slug}`} className="button-ghost">
                  Run sim
                </Link>
              )}
            </div>
            {hydrated && activePathSlug ? (
              <p className="micro-label" style={{ marginTop: "14px" }}>
                Active path: {activePathSlug}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
