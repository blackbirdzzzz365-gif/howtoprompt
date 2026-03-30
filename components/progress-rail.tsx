"use client";

import Link from "next/link";
import { useAcademyProgress } from "@/components/app-provider";
import { getPath } from "@/lib/content";

export function ProgressRail() {
  const { completedMissionSlugs, quickRefIds, activePathSlug, hydrated } = useAcademyProgress();
  const completedCount = hydrated ? completedMissionSlugs.length : 0;
  const percent = (completedCount / 6) * 100;
  const activePath = activePathSlug ? getPath(activePathSlug) : null;

  return (
    <div className="progress-rail" aria-label="Progress rail">
      <div className="progress-rail-inner">
        <div>
          <p className="micro-label">Tiến độ học</p>
          <p className="muted-copy">
            {hydrated && activePath ? `Lộ trình: ${activePath.title}` : "Bạn chưa chọn lộ trình"} ·{" "}
            {hydrated ? quickRefIds.length : 0} thẻ nhắc đã mở khóa
          </p>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
        <Link href="/missions" className="button-primary">
          Tiếp tục học
        </Link>
      </div>
    </div>
  );
}
