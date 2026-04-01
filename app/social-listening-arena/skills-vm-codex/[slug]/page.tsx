import { notFound } from "next/navigation";
import { SkillAtlasDetail } from "@/components/skill-atlas-detail";
import { getSkillAtlasCatalog, listSkillAtlasCatalogs, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { getSkillAtlas, getSkillBySlug } from "@/lib/skill-atlas";

const catalogId: SkillAtlasCatalogId = "linuxvm-codex";

export async function generateStaticParams() {
  const atlas = await getSkillAtlas(catalogId);
  return atlas.skills.map((skill) => ({ slug: skill.slug }));
}

export default async function LinuxVmCodexSkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getSkillAtlasCatalog(catalogId);
  const skill = await getSkillBySlug(catalogId, slug);

  if (!skill) {
    notFound();
  }

  if (!catalog) {
    return null;
  }

  return <SkillAtlasDetail catalog={catalog} catalogLinks={listSkillAtlasCatalogs()} skill={skill} />;
}

