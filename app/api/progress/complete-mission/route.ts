import { completeMission } from "@/lib/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    missionSlug?: string;
  };

  if (!body.userId || !body.missionSlug) {
    return Response.json({ error: "userId and missionSlug are required" }, { status: 400 });
  }

  const progress = await completeMission(body.userId, body.missionSlug);
  return Response.json({ progress });
}
