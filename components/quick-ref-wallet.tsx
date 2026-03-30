"use client";

import { useAcademyProgress } from "@/components/app-provider";
import { getMission } from "@/lib/content";
import type { QuickRef } from "@/lib/content-schema";

export function QuickRefWallet({ items }: { items: QuickRef[] }) {
  const { quickRefIds, completedMissionSlugs, hydrated } = useAcademyProgress();

  return (
    <div className="quick-ref-grid">
      {items.map((item) => {
        const unlocked = hydrated && quickRefIds.includes(item.id);
        const unlockMission = getMission(item.unlocksFromMission);

        return (
          <article key={item.id} className="quick-ref-card" data-locked={!unlocked}>
            <div className="chip-row">
              <span className="chip">{unlocked ? "Đã mở khóa" : "Chưa mở"}</span>
              <span className="outline-chip">
                {unlockMission ? `Nhiệm vụ ${String(unlockMission.order).padStart(2, "0")}` : item.unlocksFromMission}
              </span>
            </div>
            <h2 className="mission-title" style={{ marginTop: "14px" }}>
              {item.title}
            </h2>
            <p className="mission-summary" style={{ marginTop: "8px" }}>
              {item.summary}
            </p>
            <ul className="list-copy" style={{ marginTop: "12px" }}>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {!unlocked ? (
              <p className="muted-copy" style={{ marginTop: "12px" }}>
                Hoàn thành <strong>{unlockMission?.title ?? item.unlocksFromMission}</strong> để mở thẻ này.
              </p>
            ) : null}
            {hydrated && completedMissionSlugs.includes(item.unlocksFromMission) ? (
              <p className="status-message" style={{ marginTop: "12px" }}>
                Bạn có thể dùng ngay khi viết prompt thật.
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
