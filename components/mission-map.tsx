"use client";

import Link from "next/link";
import { useAcademyProgress } from "@/components/app-provider";
import { getPath } from "@/lib/content";
import type { Mission } from "@/lib/content-schema";

export function MissionMap({
  missions,
  compact = false,
}: {
  missions: Mission[];
  compact?: boolean;
}) {
  const { completedMissionSlugs, activePathSlug, hydrated } = useAcademyProgress();
  const activePath = activePathSlug ? getPath(activePathSlug) : null;

  return (
    <div className="mission-grid" data-compact={compact}>
      {missions.map((mission) => {
        const complete = hydrated && completedMissionSlugs.includes(mission.slug);

        return (
          <article key={mission.slug} className="mission-card" data-complete={complete}>
            <div className="chip-row">
              <span className="chip">Nhiệm vụ {String(mission.order).padStart(2, "0")}</span>
              <span className="outline-chip">{mission.duration}</span>
              {complete ? <span className="status-chip">Đã nắm</span> : null}
            </div>
            <h3 className="mission-title" style={{ marginTop: "14px" }}>
              {mission.title}
            </h3>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {mission.tagline}
            </p>
            <p className="muted-copy" style={{ marginTop: "12px" }}>
              Bạn sẽ làm được: {mission.outcome}
            </p>
            <div className="detail-actions" style={{ marginTop: "18px" }}>
              <Link href={`/missions/${mission.slug}`} className="button-secondary">
                Xem chi tiết
              </Link>
              {mission.practiceMode === "prompt-lab" ? (
                <Link href="/prompt-lab" className="button-ghost">
                  Thực hành
                </Link>
              ) : (
                <Link href={`/simulator?scenario=${mission.slug}`} className="button-ghost">
                  Mô phỏng
                </Link>
              )}
            </div>
            {hydrated && activePath ? (
              <p className="micro-label" style={{ marginTop: "14px" }}>
                Lộ trình đang chọn: {activePath.title}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
