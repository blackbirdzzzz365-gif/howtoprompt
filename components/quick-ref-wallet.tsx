"use client";

import { useAcademyProgress } from "@/components/app-provider";
import { Chip } from "@/components/ui/chip";
import { Surface } from "@/components/ui/surface";
import type { QuickRef } from "@/lib/content-schema";

export function QuickRefWallet({ items }: { items: QuickRef[] }) {
  const { quickRefIds, completedMissionSlugs, hydrated } = useAcademyProgress();

  return (
    <div className="quick-ref-grid">
      {items.map((item) => {
        const unlocked = hydrated && quickRefIds.includes(item.id);

        return (
          <Surface key={item.id} as="article" variant="quickRef" data-locked={!unlocked}>
            <div className="chip-row">
              <Chip>{unlocked ? "Unlocked" : "Locked"}</Chip>
              <Chip variant="outline">{item.unlocksFromMission}</Chip>
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
                Complete stage <strong>{item.unlocksFromMission}</strong> de mo khoa card nay.
              </p>
            ) : null}
            {hydrated && completedMissionSlugs.includes(item.unlocksFromMission) ? (
              <p className="status-message" style={{ marginTop: "12px" }}>
                San sang de copy vao prompt that.
              </p>
            ) : null}
          </Surface>
        );
      })}
    </div>
  );
}
