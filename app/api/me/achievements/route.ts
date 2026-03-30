import { getAchievements } from "@/lib/runtime-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const achievements = await getAchievements(userId);
  return Response.json({ achievements });
}
