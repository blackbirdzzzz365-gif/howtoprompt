import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { buildCatalogPayload } from "@/lib/skill-atlas-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ catalog: string }> },
) {
  const { catalog: catalogParam } = await params;
  const catalog = catalogParam as SkillAtlasCatalogId;
  if (!getSkillAtlasCatalog(catalog)) {
    return Response.json({ error: "Catalog not found" }, { status: 404 });
  }

  return Response.json(await buildCatalogPayload(catalog));
}
