import { getSkillBySlug } from "@/lib/skill-atlas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  return Response.json({ skill });
}
