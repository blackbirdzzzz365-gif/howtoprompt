"use client";

import { useAcademyProgress } from "@/components/app-provider";
import type { LearningPath } from "@/lib/content-schema";

export function PathChooser({ paths }: { paths: LearningPath[] }) {
  const { activePathSlug, selectPath, recordEvent, hydrated } = useAcademyProgress();

  return (
    <div className="path-grid">
      {paths.map((path) => (
        <button
          key={path.slug}
          type="button"
          className="path-card"
          data-active={hydrated && activePathSlug === path.slug}
          onClick={() => {
            selectPath(path.slug);
            void recordEvent("path_focus", { pathSlug: path.slug });
          }}
        >
          <p className="eyebrow">Gợi ý</p>
          <h3 className="mission-title">{path.title}</h3>
          <p className="mission-summary" style={{ marginTop: "8px" }}>
            {path.summary}
          </p>
          <p className="muted-copy" style={{ marginTop: "12px" }}>
            Phù hợp với: {path.recommendedFor}
          </p>
          <div className="chip-row" style={{ marginTop: "16px" }}>
            <span className="chip">{path.primaryMissionSlugs.length} nhiệm vụ</span>
            {hydrated && activePathSlug === path.slug ? <span className="status-chip">Đang theo</span> : null}
          </div>
        </button>
      ))}
    </div>
  );
}
