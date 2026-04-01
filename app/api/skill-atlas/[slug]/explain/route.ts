import { z } from "zod";
import { callChiasegpuChat, parseLooseJson, resolveChiasegpuModel } from "@/lib/chiasegpu";
import { getSkillBySlug } from "@/lib/skill-atlas";

const requestSchema = z.object({
  apiKey: z.string().min(1),
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

  const selectedModel = await resolveChiasegpuModel(body.apiKey);
  const referenceContext = skill.referencedDocs
    .filter((doc) => doc.raw)
    .slice(0, 6)
    .map(
      (doc) =>
        [
          `### ${doc.label}`,
          `Title: ${doc.title}`,
          doc.excerpt,
        ].join("\n"),
    )
    .join("\n\n");
  const trimmedSkillContext = [
    `Tên skill: ${skill.name}`,
    `Mô tả ngắn: ${skill.summaryVi}`,
    `Trigger phrases: ${skill.triggerPhrases.slice(0, 6).join(" | ") || "không có"}`,
    `Workflow highlights: ${skill.workflowHighlights.slice(0, 6).join(" | ") || "không có"}`,
    `Guardrails: ${skill.guardrails.slice(0, 6).join(" | ") || "không có"}`,
    `Related skills: ${skill.relatedSkillNames.slice(0, 6).join(" | ") || "không có"}`,
    `Sections: ${skill.sections.map((section) => `${section.title}: ${section.body}`).slice(0, 6).join(" | ") || "không có"}`,
    referenceContext ? `Referral docs:\n${referenceContext}` : "",
    `Raw skill excerpt:\n${skill.raw.slice(0, 6000)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  let providerError = "";
  let parsed: Record<string, unknown> | null = null;

  try {
    const responseText = await callChiasegpuChat({
      apiKey: body.apiKey,
      model: selectedModel,
      temperature: 0.15,
      maxTokens: 1500,
      messages: [
        {
          role: "system",
          content:
            "Bạn là người giải thích skill cho owner đang học Codex. Hãy đọc skill và referral docs đã được tóm lược, rồi trả lời bằng tiếng Việt rõ ràng, dễ hiểu, không chung chung. Phản hồi JSON hợp lệ với schema: {\"overview_vi\": string, \"when_to_use_vi\": string[], \"workflow_vi\": string[], \"guardrails_vi\": string[], \"related_skills_vi\": string, \"example_prompts_vi\": string[]}. Không thêm markdown hay text ngoài JSON.",
        },
        {
          role: "user",
          content: [
            body.question
              ? `Câu hỏi thêm của người dùng: ${body.question}`
              : "Không có câu hỏi thêm. Hãy giải thích tổng quan và chi tiết.",
            trimmedSkillContext,
          ].join("\n\n"),
        },
      ],
    });

    parsed = parseLooseJson(responseText);
    if (!parsed) {
      providerError = "Không parse được JSON từ phản hồi của model.";
    }
  } catch (error) {
    providerError = error instanceof Error ? error.message : "Không gọi được provider AI.";
  }

  const fallback = buildFallbackExplanation(skill, body.question || "");

  return Response.json({
    model: selectedModel,
    providerError: providerError || null,
    usedFallback: Boolean(providerError) || !parsed,
    response:
      parsed && typeof parsed === "object"
        ? parsed
        : {
            ...fallback,
            related_skills_vi: providerError
              ? `${fallback.related_skills_vi} Hiện AI provider đang lỗi hoặc timeout nên trang đang hiển thị phần giải thích cục bộ.`
              : fallback.related_skills_vi,
          },
  });
}

function buildFallbackExplanation(
  skill: NonNullable<Awaited<ReturnType<typeof getSkillBySlug>>>,
  question: string,
) {
  return {
    overview_vi: [
      skill.summaryVi,
      question ? `Câu hỏi bạn vừa thêm là: "${question}". Phần dưới đây đang dùng giải thích cục bộ từ dữ liệu đã sync.` : "Phần dưới đây đang dùng giải thích cục bộ từ dữ liệu đã sync.",
    ].join(" "),
    when_to_use_vi:
      skill.triggerPhrases.slice(0, 5).map((item) => `Dùng khi tình huống của bạn gần với: "${item}".`) ||
      [],
    workflow_vi:
      skill.workflowHighlights.length > 0
        ? skill.workflowHighlights.slice(0, 6).map((item, index) => `Bước ${index + 1}: ${item}`)
        : ["Skill này chưa có workflow highlights được trích sẵn trong atlas."],
    guardrails_vi:
      skill.guardrails.length > 0
        ? skill.guardrails.slice(0, 6)
        : ["Hãy xem thêm raw SKILL.md để đọc đầy đủ guardrails của skill này."],
    related_skills_vi:
      skill.relatedSkillNames.length > 0
        ? `Skill này thường đi cùng: ${skill.relatedSkillNames.join(", ")}.`
        : "Skill này hiện chưa có related skills được map rõ từ raw docs.",
    example_prompts_vi: skill.triggerPhrases
      .slice(0, 3)
      .map((item) => `Bạn có thể bắt đầu prompt theo tinh thần: ${item}`),
  };
}
