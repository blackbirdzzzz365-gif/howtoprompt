import { z } from "zod";
import { callChiasegpuChat, parseLooseJson, resolveChiasegpuModel } from "@/lib/chiasegpu";
import { getSkillAtlas, shortlistSkills } from "@/lib/skill-atlas";

const requestSchema = z.object({
  apiKey: z.string().min(1),
  need: z.string().trim().min(8),
});

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json());
  const atlas = await getSkillAtlas();
  const shortlist = await shortlistSkills(body.need, 8);
  const selectedModel = await resolveChiasegpuModel(body.apiKey);
  const compactCatalog = atlas.skills
    .map((skill) => `- ${skill.name} | ${skill.category} | ${skill.summaryVi}`)
    .join("\n");

  const detailedCandidates = (shortlist.length > 0
    ? shortlist
    : atlas.skills.slice(0, 6).map((skill) => ({ skill, score: 0 })))
    .map(({ skill, score }) =>
      [
        `## ${skill.name}`,
        `Điểm local: ${score}`,
        `Tóm tắt: ${skill.summaryVi}`,
        `Workflow chính: ${skill.workflowHighlights.slice(0, 3).join(" | ") || "không có"}`,
        `Skill liên quan: ${skill.relatedSkillNames.slice(0, 4).join(" | ") || "không có"}`,
      ].join("\n"),
    )
    .join("\n\n");

  let providerError = "";
  let parsed: Record<string, unknown> | null = null;

  try {
    const responseText = await callChiasegpuChat({
      apiKey: body.apiKey,
      model: selectedModel,
      temperature: 0.2,
      maxTokens: 1400,
      messages: [
        {
          role: "system",
          content:
            "Bạn là Codex Skill Advisor. Chỉ được đề xuất skill có trong catalog được cung cấp. Trả lời bằng tiếng Việt rõ ràng, ưu tiên bộ skill tối thiểu cần thiết. Phản hồi JSON hợp lệ với schema: {\"answer_vi\": string, \"recommended_skills\": [{\"slug\": string, \"name\": string, \"reason_vi\": string, \"confidence\": \"cao\" | \"vừa\" | \"thấp\"}], \"follow_up_vi\": string, \"notes_vi\": string[]}. Không thêm markdown hay text ngoài JSON.",
        },
        {
          role: "user",
          content: [
            `Mong muốn của người dùng:\n${body.need}`,
            "Toàn bộ skill hiện có:",
            compactCatalog,
            "Nhóm skill đã được local shortlist để model đọc kỹ hơn:",
            detailedCandidates,
            "Hãy đề xuất bộ skill phù hợp nhất và giải thích vì sao.",
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

  const fallbackResponse = buildFallbackAdvice(body.need, shortlist);

  return Response.json({
    model: selectedModel,
    providerError: providerError || null,
    usedFallback: Boolean(providerError) || !parsed,
    shortlist: shortlist.map(({ skill, score }) => ({
      slug: skill.slug,
      name: skill.name,
      score,
      category: skill.category,
    })),
    response:
      parsed && typeof parsed === "object"
        ? parsed
        : {
            ...fallbackResponse,
            notes_vi: providerError
              ? [...fallbackResponse.notes_vi, `AI provider đang lỗi hoặc timeout: ${providerError}`]
              : fallbackResponse.notes_vi,
          },
  });
}

function buildFallbackAdvice(
  userNeed: string,
  shortlist: Awaited<ReturnType<typeof shortlistSkills>>,
) {
  const recommendedSkills = shortlist.slice(0, 3).map(({ skill }, index) => ({
    slug: skill.slug,
    name: skill.name,
    reason_vi:
      index === 0
        ? `Đây là skill khớp nhất với nhu cầu hiện tại: ${skill.summaryVi}`
        : `Skill này hỗ trợ hoặc nối tiếp logic cho skill chính: ${skill.summaryVi}`,
    confidence: index === 0 ? "cao" : "vừa",
  }));

  return {
    answer_vi:
      recommendedSkills.length > 0
        ? "Hiện hệ thống đang dùng suy luận cục bộ để gợi ý skill. Bộ skill dưới đây là nhóm phù hợp nhất với nhu cầu bạn vừa mô tả."
        : `Hiện hệ thống chưa tìm thấy skill khớp rõ ràng với yêu cầu: "${userNeed}". Bạn nên mô tả rõ hơn mục tiêu, loại repo và điểm dừng mong muốn.`,
    recommended_skills: recommendedSkills,
    follow_up_vi:
      recommendedSkills.length > 0
        ? `Bạn có thể bắt đầu bằng skill "${recommendedSkills[0].name}", sau đó mở trang chi tiết để xem workflow, guardrails và skill liên quan.`
        : "Hãy bổ sung ngữ cảnh như repo, môi trường production hay loại quyết định bạn muốn Codex thực hiện.",
    notes_vi: [
      "Danh sách trên được chọn từ shortlist local của chính catalog skill đã sync vào app.",
    ],
  };
}
