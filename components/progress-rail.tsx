"use client";

import Link from "next/link";
import { useAcademyProgress } from "@/components/app-provider";

export function ProgressRail() {
  const { completedMissionSlugs, quickRefIds, activePathSlug, hydrated } = useAcademyProgress();
  const completedCount = hydrated ? completedMissionSlugs.length : 0;
  const percent = (completedCount / 6) * 100;

  return (
    <div className="progress-rail" aria-label="Progress rail">
      <div className="progress-rail-inner">
        <div>
          <p className="micro-label">Academy progress</p>
          <p className="muted-copy">
            {hydrated && activePathSlug ? `Path: ${activePathSlug}` : "Chua chon path"} ·{" "}
            {hydrated ? quickRefIds.length : 0} quick refs mo khoa
          </p>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
        <Link href="/missions" className="button-primary">
          Resume missions
        </Link>
      </div>
    </div>
  );
}
