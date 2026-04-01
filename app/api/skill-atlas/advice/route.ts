import { z } from "zod";
import { callChiasegpuChat, getDefaultChiasegpuModel, parseLooseJson } from "@/lib/chiasegpu";
import { getSkillAtlas, shortlistSkills } from "@/lib/skill-atlas";

const requestSchema = z.object({
  apiKey: z.string().min(1),
  model: z.string().trim().optional(),
  need: z.string().trim().min(8),
});

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json());
  const atlas = await getSkillAtlas();
  const shortlist = await shortlistSkills(body.need, 8);

  const compactCatalog = atlas.skills
    .map((skill) => `- ${skill.name} | ${skill.category} | ${skill.summaryVi}`)
    .join("\n");

  const detailedCandidates = (shortlist.length > 0 ? shortlist : atlas.skills.slice(0, 8).map((skill) => ({ skill, score: 0 })))
    .map(
      ({ skill, score }) =>
        [
          `## ${skill.name}`,
          `Local score: ${score}`,
          skill.advisorContext,
          `Raw skill excerpt:\n${skill.raw.slice(0, 5000)}`,
        ].join("\n"),
    )
    .join("\n\n");

  const responseText = await callChiasegpuChat({
    apiKey: body.apiKey,
    model: body.model || getDefaultChiasegpuModel(),
    temperature: 0.2,
    maxTokens: 1700,
    messages: [
      {
        role: "system",
        content:
          "Ban la Codex Skill Advisor. Chi duoc de xuat skill co trong catalog duoc cung cap. Tra loi bang tieng Viet, uu tien bo skill toi thieu can thiet. Phan hoi JSON hop le voi schema: {\"answer_vi\": string, \"recommended_skills\": [{\"slug\": string, \"name\": string, \"reason_vi\": string, \"confidence\": \"cao\" | \"vua\" | \"thap\"}], \"follow_up_vi\": string, \"notes_vi\": string[]}. Khong them markdown hay text ngoai JSON.",
      },
      {
        role: "user",
        content: [
          `Mong muon cua user:\n${body.need}`,
          "Tat ca skill dang co:",
          compactCatalog,
          "Skill candidate da duoc local shortlist de model doc ky hon:",
          detailedCandidates,
          "Hay de xuat bo skill phu hop nhat va giai thich vi sao.",
        ].join("\n\n"),
      },
    ],
  });

  const parsed = parseLooseJson(responseText);

  return Response.json({
    model: body.model || getDefaultChiasegpuModel(),
    shortlist: shortlist.map(({ skill, score }) => ({
      slug: skill.slug,
      name: skill.name,
      score,
      category: skill.category,
    })),
    response: parsed ?? {
      answer_vi: responseText,
      recommended_skills: [],
      follow_up_vi: "Khong parse duoc JSON tu model. Hay doc phan answer_vi thuan van ban.",
      notes_vi: [],
    },
  });
}
