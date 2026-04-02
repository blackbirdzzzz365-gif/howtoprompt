import { notFound } from "next/navigation";
import { MissionDetailView } from "@/components/mission-detail-view";
import { getMission, getQuickRef, getScenariosForMission, missions } from "@/lib/content";

export function generateStaticParams() {
  return missions.map((mission) => ({ slug: mission.slug }));
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = getMission(slug);
  if (!mission) {
    notFound();
  }

  const quickRef = getQuickRef(mission.quickRefId);
  const missionScenarios = getScenariosForMission(mission.slug);

  return (
    <MissionDetailView
      mission={mission}
      quickRef={quickRef ?? undefined}
      missionScenarios={missionScenarios}
      relatedMissions={missions.filter((item) => item.order !== mission.order).slice(0, 2)}
    />
  );
}
