import { z } from "zod";
import { callChiasegpuChat, getDefaultChiasegpuModel, parseLooseJson } from "@/lib/chiasegpu";
import { getSkillBySlug } from "@/lib/skill-atlas";

const requestSchema = z.object({
  apiKey: z.string().min(1),
  model: z.string().trim().optional(),
  question: z.string().trim().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = requestSchema.parse(await request.json());
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  const referenceContext = skill.referencedDocs
    .filter((doc) => doc.raw)
    .slice(0, 10)
    .map(
      (doc) =>
        [
          `### ${doc.label}`,
          `Title: ${doc.title}`,
          doc.raw,
        ].join("\n"),
    )
    .join("\n\n");

  const responseText = await callChiasegpuChat({
    apiKey: body.apiKey,
    model: body.model || getDefaultChiasegpuModel(),
    temperature: 0.15,
    maxTokens: 1800,
    messages: [
      {
        role: "system",
        content:
          "Ban la nguoi giai thich skill cho owner dang hoc Codex. Hay doc toan bo skill va referral docs duoc cung cap, roi tra loi bang tieng Viet ro rang, de hieu, khong chung chung. Phan hoi JSON hop le voi schema: {\"overview_vi\": string, \"when_to_use_vi\": string[], \"workflow_vi\": string[], \"guardrails_vi\": string[], \"related_skills_vi\": string, \"example_prompts_vi\": string[]}. Khong them markdown hay text ngoai JSON.",
      },
      {
        role: "user",
        content: [
          `Skill: ${skill.name}`,
          `Summary seed: ${skill.summaryVi}`,
          body.question ? `Cau hoi them cua user: ${body.question}` : "Khong co cau hoi them. Hay giai thich tong quan va chi tiet.",
          "Noi dung raw SKILL.md:",
          skill.raw,
          referenceContext ? "Referral docs:" : "",
          referenceContext,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  const parsed = parseLooseJson(responseText);

  return Response.json({
    model: body.model || getDefaultChiasegpuModel(),
    response:
      parsed ?? {
        overview_vi: responseText,
        when_to_use_vi: [],
        workflow_vi: [],
        guardrails_vi: [],
        related_skills_vi: "",
        example_prompts_vi: [],
      },
  });
}
