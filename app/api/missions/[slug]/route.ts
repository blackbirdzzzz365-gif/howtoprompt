import { getMission, getScenariosForMission } from "@/lib/content";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const mission = getMission(slug);

  if (!mission) {
    return Response.json({ error: "Mission not found" }, { status: 404 });
  }

  return Response.json({
    mission,
    scenarios: getScenariosForMission(mission.slug),
  });
}
