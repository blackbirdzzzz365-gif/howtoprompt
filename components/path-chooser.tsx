"use client";

import { useAcademyProgress } from "@/components/app-provider";
import { Chip } from "@/components/ui/chip";
import type { LearningPath } from "@/lib/content-schema";

export function PathChooser({ paths }: { paths: LearningPath[] }) {
  const { activePathSlug, selectPath, recordEvent, hydrated } = useAcademyProgress();

  return (
    <div className="path-grid">
      {paths.map((path) => (
        <button
          key={path.slug}
          type="button"
          className="path-card stack-lg"
          data-active={hydrated && activePathSlug === path.slug}
          onClick={() => {
            selectPath(path.slug);
            void recordEvent("path_focus", { pathSlug: path.slug });
          }}
        >
          <div className="stack-sm">
            <p className="eyebrow">Recommended path</p>
            <div className="stack-xs">
              <h3 className="mission-title">{path.title}</h3>
              <p className="mission-summary">{path.summary}</p>
            </div>
          </div>

          <p className="muted-copy">Hợp với: {path.recommendedFor}</p>

          <div className="chip-row">
            <Chip variant="neutral">{path.primaryMissionSlugs.length} missions</Chip>
            <Chip variant="outline">focus route</Chip>
            {hydrated && activePathSlug === path.slug ? <Chip variant="success">Dang theo</Chip> : null}
          </div>
        </button>
      ))}
    </div>
  );
}
