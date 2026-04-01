import { getSkillAtlas, getSkillAtlasList } from "@/lib/skill-atlas";

export async function GET() {
  const atlas = await getSkillAtlas();
  const skills = await getSkillAtlasList();

  const categories = Object.entries(
    skills.reduce<Record<string, number>>((accumulator, skill) => {
      accumulator[skill.category] = (accumulator[skill.category] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return Response.json({
    generatedAt: atlas.generatedAt,
    stats: atlas.stats,
    sourceRoots: atlas.sourceRoots,
    categories,
    skills,
  });
}
