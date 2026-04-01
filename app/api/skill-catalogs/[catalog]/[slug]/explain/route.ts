import { z } from "zod";
import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { buildExplainPayload } from "@/lib/skill-atlas-service";

const requestSchema = z.object({
  apiKey: z.string().min(1),
  question: z.string().trim().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ catalog: string; slug: string }> },
) {
  const { catalog: catalogParam, slug } = await params;
  const catalog = catalogParam as SkillAtlasCatalogId;
  if (!getSkillAtlasCatalog(catalog)) {
    return Response.json({ error: "Catalog not found" }, { status: 404 });
  }

  const body = requestSchema.parse(await request.json());
  const payload = await buildExplainPayload(catalog, slug, body.apiKey, body.question);

  if (!payload) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  return Response.json(payload);
}
