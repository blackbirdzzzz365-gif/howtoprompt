import { z } from "zod";
import { defaultSkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { buildAdvicePayload } from "@/lib/skill-atlas-service";

const requestSchema = z.object({
  apiKey: z.string().min(1),
  need: z.string().trim().min(8),
});

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json());
  return Response.json(await buildAdvicePayload(defaultSkillAtlasCatalogId, body.apiKey, body.need));
}
