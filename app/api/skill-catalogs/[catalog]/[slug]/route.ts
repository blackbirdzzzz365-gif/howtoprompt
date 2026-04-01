import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { getSkillBySlug } from "@/lib/skill-atlas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ catalog: string; slug: string }> },
) {
  const { catalog: catalogParam, slug } = await params;
  const catalog = catalogParam as SkillAtlasCatalogId;
  if (!getSkillAtlasCatalog(catalog)) {
    return Response.json({ error: "Catalog not found" }, { status: 404 });
  }

  const skill = await getSkillBySlug(catalog, slug);
  if (!skill) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  return Response.json({ skill });
}
