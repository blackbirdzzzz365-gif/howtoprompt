import { getSkillAtlasCatalog, type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { getSkillBySlug, getSkillReferenceDoc } from "@/lib/skill-atlas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ catalog: string; slug: string }> },
) {
  const { catalog: catalogParam, slug } = await params;
  const catalog = catalogParam as SkillAtlasCatalogId;
  if (!getSkillAtlasCatalog(catalog)) {
    return new Response("Catalog not found", { status: 404 });
  }

  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");

  if (!ref || ref === "skill") {
    const skill = await getSkillBySlug(catalog, slug);
    if (!skill) {
      return new Response("Skill not found", { status: 404 });
    }

    return new Response(skill.raw, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `inline; filename="${skill.slug}-SKILL.md"`,
      },
    });
  }

  const doc = await getSkillReferenceDoc(catalog, slug, ref);
  if (!doc || !doc.raw) {
    return new Response("Reference doc not found", { status: 404 });
  }

  return new Response(doc.raw, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `inline; filename="${doc.id}.txt"`,
    },
  });
}
