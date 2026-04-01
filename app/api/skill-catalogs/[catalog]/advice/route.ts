import { z } from "zod";
import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { buildAdvicePayload } from "@/lib/skill-atlas-service";

const requestSchema = z.object({
  apiKey: z.string().min(1),
  need: z.string().trim().min(8),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ catalog: string }> },
) {
  const { catalog: catalogParam } = await params;
  const catalog = catalogParam as SkillAtlasCatalogId;
  if (!getSkillAtlasCatalog(catalog)) {
    return Response.json({ error: "Catalog not found" }, { status: 404 });
  }

  const body = requestSchema.parse(await request.json());
  return Response.json(await buildAdvicePayload(catalog, body.apiKey, body.need));
}
