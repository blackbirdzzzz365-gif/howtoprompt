import { defaultSkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { buildCatalogPayload } from "@/lib/skill-atlas-service";

export async function GET() {
  return Response.json(await buildCatalogPayload(defaultSkillAtlasCatalogId));
}
