import { SkillAtlasDirectory } from "@/components/skill-atlas-directory";
import { getSkillAtlas, getSkillAtlasList } from "@/lib/skill-atlas";

export default async function SkillAtlasPage() {
  const atlas = await getSkillAtlas();
  const skills = await getSkillAtlasList();
  const categories = [...new Set(skills.map((skill) => skill.category))].sort((left, right) =>
    left.localeCompare(right),
  );

  return (
    <SkillAtlasDirectory
      generatedAt={atlas.generatedAt}
      skillCount={atlas.stats.skillCount}
      referenceCount={atlas.stats.referenceCount}
      categories={categories}
      skills={skills}
    />
  );
}
