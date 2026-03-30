"use client";

import { useAcademyProgress } from "@/components/app-provider";
import type { QuickRef } from "@/lib/content-schema";

export function QuickRefWallet({ items }: { items: QuickRef[] }) {
  const { quickRefIds, completedMissionSlugs, hydrated } = useAcademyProgress();

  return (
    <div className="quick-ref-grid">
      {items.map((item) => {
        const unlocked = hydrated && quickRefIds.includes(item.id);

        return (
          <article key={item.id} className="quick-ref-card" data-locked={!unlocked}>
            <div className="chip-row">
              <span className="chip">{unlocked ? "Unlocked" : "Locked"}</span>
              <span className="outline-chip">{item.unlocksFromMission}</span>
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
                Complete mission <strong>{item.unlocksFromMission}</strong> de mo khoa card nay.
              </p>
            ) : null}
            {hydrated && completedMissionSlugs.includes(item.unlocksFromMission) ? (
              <p className="status-message" style={{ marginTop: "12px" }}>
                San sang de copy vao prompt that.
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
