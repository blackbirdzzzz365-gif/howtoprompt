import { callChiasegpuChat, parseLooseJson, resolveChiasegpuModel } from "@/lib/chiasegpu";
import { type SkillAtlasCatalogId } from "@/lib/skill-atlas-catalogs";
import { getSkillAtlas, getSkillAtlasList, getSkillBySlug, shortlistSkills } from "@/lib/skill-atlas";

export async function buildCatalogPayload(atlasId: SkillAtlasCatalogId) {
  const atlas = await getSkillAtlas(atlasId);
  const skills = await getSkillAtlasList(atlasId);

  const categories = Object.entries(
    skills.reduce<Record<string, number>>((accumulator, skill) => {
      accumulator[skill.category] = (accumulator[skill.category] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    generatedAt: atlas.generatedAt,
    stats: atlas.stats,
    sourceRoots: atlas.sourceRoots,
    categories,
    skills,
  };
}

export async function buildAdvicePayload(atlasId: SkillAtlasCatalogId, apiKey: string, need: string) {
  const atlas = await getSkillAtlas(atlasId);
  const shortlist = await shortlistSkills(atlasId, need, 8);
  const selectedModel = await resolveChiasegpuModel(apiKey);
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
      apiKey,
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
            `Mong muốn của người dùng:\n${need}`,
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

  const fallbackResponse = buildFallbackAdvice(need, shortlist);

  return {
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
  };
}

export async function buildExplainPayload(
  atlasId: SkillAtlasCatalogId,
  slug: string,
  apiKey: string,
  question = "",
) {
  const skill = await getSkillBySlug(atlasId, slug);
  if (!skill) {
    return null;
  }

  const selectedModel = await resolveChiasegpuModel(apiKey);
  const referenceContext = skill.referencedDocs
    .filter((doc) => doc.raw)
    .slice(0, 6)
    .map((doc) => [`### ${doc.label}`, `Title: ${doc.title}`, doc.excerpt].join("\n"))
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
      apiKey,
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
            question
              ? `Câu hỏi thêm của người dùng: ${question}`
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

  const fallback = buildFallbackExplanation(skill, question);

  return {
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
  };
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
    notes_vi: ["Danh sách trên được chọn từ shortlist local của chính catalog skill đã sync vào app."],
  };
}

function buildFallbackExplanation(
  skill: NonNullable<Awaited<ReturnType<typeof getSkillBySlug>>>,
  question: string,
) {
  return {
    overview_vi: [
      skill.summaryVi,
      question
        ? `Câu hỏi bạn vừa thêm là: "${question}". Phần dưới đây đang dùng giải thích cục bộ từ dữ liệu đã sync.`
        : "Phần dưới đây đang dùng giải thích cục bộ từ dữ liệu đã sync.",
    ].join(" "),
    when_to_use_vi:
      skill.triggerPhrases.slice(0, 5).map((item) => `Dùng khi tình huống của bạn gần với: "${item}".`) || [],
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
