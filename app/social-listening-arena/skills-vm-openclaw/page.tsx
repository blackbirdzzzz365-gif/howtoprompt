import { SkillAtlasDirectory } from "@/components/skill-atlas-directory";
import { getSkillAtlasCatalog, listSkillAtlasCatalogs, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { getSkillAtlas, getSkillAtlasList } from "@/lib/skill-atlas";

const catalogId: SkillAtlasCatalogId = "linuxvm-openclaw";

export default async function LinuxVmOpenClawSkillAtlasPage() {
  const catalog = getSkillAtlasCatalog(catalogId);
  const atlas = await getSkillAtlas(catalogId);
  const skills = await getSkillAtlasList(catalogId);
  const categories = [...new Set(skills.map((skill) => skill.category))].sort((left, right) =>
    left.localeCompare(right),
  );

  if (!catalog) {
    return null;
  }

  return (
    <SkillAtlasDirectory
      catalog={catalog}
      catalogLinks={listSkillAtlasCatalogs()}
      generatedAt={atlas.generatedAt}
      skillCount={atlas.stats.skillCount}
      referenceCount={atlas.stats.referenceCount}
      categories={categories}
      skills={skills}
    />
  );
}

