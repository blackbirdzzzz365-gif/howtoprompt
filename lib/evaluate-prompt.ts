import { clamp, normalizeText } from "@/lib/utils";

export type PromptBand = "Unsafe" | "Needs work" | "Good" | "Excellent";

export type PromptEvaluation = {
  band: PromptBand;
  scoreTotal: number;
  scoreBreakdown: {
    clarity: number;
    contextSafety: number;
    operationalControl: number;
    botFit: number;
  };
  rubric: Array<{
    id: string;
    status: "pass" | "warn" | "fail";
    message: string;
  }>;
  systemInterpretation: string;
  rewriteSuggestions: string[];
};

const BOT_HINTS: Record<string, string[]> = {
  linux_main: ["deploy", "runtime", "integration", "supervisor", "orchestr", "coord", "report"],
  lavis_linux: ["analysis", "phan tich", "review", "spec", "root cause", "kien truc", "architecture"],
  gaubot: ["implement", "fix", "code", "docker-compose", "refactor", "patch", "build"],
};

function scoreBotFit(selectedBot: string, normalizedPrompt: string) {
  if (!selectedBot) {
    return {
      score: 10,
      status: "warn" as const,
      message: "Bạn chưa chọn bot, nên Prompt Lab chưa thể chấm đầy đủ mức độ phù hợp.",
    };
  }

  const hints = BOT_HINTS[selectedBot] ?? [];
  const matches = hints.filter((hint) => normalizedPrompt.includes(hint));

  if (matches.length >= 1) {
    return {
      score: 24,
      status: "pass" as const,
      message: `Nội dung hiện tại khá hợp với vai trò chính của ${selectedBot}.`,
    };
  }

  return {
    score: 8,
    status: "warn" as const,
    message: `Prompt chưa cho thấy rõ vì sao ${selectedBot} là bot phù hợp nhất cho việc này.`,
  };
}

export function evaluatePrompt(promptText: string, selectedBot: string) {
  const normalizedPrompt = normalizeText(promptText);
  const hasCodexDirective =
    normalizedPrompt.includes("hay tro chuyen voi codex") ||
    normalizedPrompt.includes("tro chuyen voi codex") ||
    normalizedPrompt.includes("talk to codex");
  const hasRepo =
    /(repo|repository)\s*[:\-]/.test(normalizedPrompt) ||
    normalizedPrompt.includes("repo ") ||
    normalizedPrompt.includes("github.com/");
  const hasGoal = normalizedPrompt.includes("muc tieu") || normalizedPrompt.includes("goal:");
  const hasRule =
    normalizedPrompt.includes("rule") ||
    normalizedPrompt.includes("chi hoi toi neu blocked") ||
    normalizedPrompt.includes("only ask me if blocked");
  const mentionsContinueIssue = normalizedPrompt.includes("cung issue nay");
  const mentionsNewIssue =
    normalizedPrompt.includes("day la issue moi") ||
    normalizedPrompt.includes("issue moi") ||
    normalizedPrompt.includes("new issue");
  const contextConflict = mentionsContinueIssue && mentionsNewIssue;

  let clarity = 0;
  const rubric: PromptEvaluation["rubric"] = [];
  const rewriteSuggestions: string[] = [];

  if (hasCodexDirective) {
    clarity += 18;
    rubric.push({
      id: "codex-directive",
      status: "pass",
      message: "Bạn đã nói rõ muốn bot phối hợp với Codex.",
    });
  } else {
    rubric.push({
      id: "codex-directive",
      status: "fail",
      message: "Prompt chưa nói rõ bot cần trò chuyện với Codex.",
    });
    rewriteSuggestions.push("Thêm dòng mở đầu như: '@bot hãy trò chuyện với Codex và xử lý việc này.'");
  }

  if (hasRepo) {
    clarity += 18;
    rubric.push({
      id: "repo",
      status: "pass",
      message: "Repo đã được nêu rõ nên hidden system không phải đoán phạm vi.",
    });
  } else {
    rubric.push({
      id: "repo",
      status: "fail",
      message: "Prompt đang thiếu repo. Đây là lý do rất hay khiến supervisor phải hỏi lại sớm.",
    });
    rewriteSuggestions.push("Thêm dòng 'Repo: <tên-repo>' để dispatcher có điểm đến rõ ràng.");
  }

  if (hasGoal) {
    clarity += 18;
    rubric.push({
      id: "goal",
      status: "pass",
      message: "Mục tiêu đầu ra đã được nêu khá rõ.",
    });
  } else {
    rubric.push({
      id: "goal",
      status: "fail",
      message: "Mục tiêu chưa rõ nên prompt rất dễ rơi vào kiểu 'check giúp tôi'.",
    });
    rewriteSuggestions.push("Thêm 'Mục tiêu: <goal cụ thể, có điểm dừng rõ ràng>'.");
  }

  const contextSafety = clamp(
    (mentionsContinueIssue ? 14 : 0) + (mentionsNewIssue ? 14 : 0) - (contextConflict ? 10 : 0) + 8,
    0,
    30,
  );

  if (contextConflict) {
    rubric.push({
      id: "context-safety",
      status: "fail",
      message: "Prompt vừa nói 'cùng issue này' vừa nói 'issue mới', nên context sẽ bị xung đột.",
    });
    rewriteSuggestions.push("Chỉ giữ một trong hai ý: 'cùng issue này' hoặc 'đây là issue mới'.");
  } else if (mentionsContinueIssue || mentionsNewIssue) {
    rubric.push({
      id: "context-safety",
      status: "pass",
      message: "Issue boundary đã rõ nên nguy cơ context drift thấp hơn nhiều.",
    });
  } else {
    rubric.push({
      id: "context-safety",
      status: "warn",
      message: "Prompt chưa nói rõ đây là issue cũ hay issue mới. Trong section cũ, điều này rất dễ gây resume nhầm.",
    });
    rewriteSuggestions.push("Nếu đang tiếp tục việc cũ, thêm 'cùng issue này'. Nếu mở việc mới, thêm 'đây là issue mới'.");
  }

  const operationalControl = hasRule ? 26 : 8;
  if (hasRule) {
    rubric.push({
      id: "rule",
      status: "pass",
      message: "Prompt đã có rule đủ rõ để supervisor biết khi nào nên tự loop và khi nào phải dừng.",
    });
  } else {
    rubric.push({
      id: "rule",
      status: "warn",
      message: "Prompt chưa có stop rule rõ, nên bot dễ hỏi lại quá sớm hoặc dừng giữa chừng.",
    });
    rewriteSuggestions.push("Thêm 'Rule: chỉ hỏi tôi nếu thật sự bị chặn hoặc cần business decision'.");
  }

  const botFitResult = scoreBotFit(selectedBot, normalizedPrompt);
  rubric.push({
    id: "bot-fit",
    status: botFitResult.status,
    message: botFitResult.message,
  });

  const scoreBreakdown = {
    clarity,
    contextSafety,
    operationalControl,
    botFit: botFitResult.score,
  };

  const scoreTotal = clamp(
    scoreBreakdown.clarity +
      scoreBreakdown.contextSafety +
      scoreBreakdown.operationalControl +
      scoreBreakdown.botFit,
    0,
    100,
  );

  const band: PromptBand =
    scoreTotal >= 85 ? "Excellent" : scoreTotal >= 70 ? "Good" : scoreTotal >= 48 ? "Needs work" : "Unsafe";

  const systemInterpretation = hasRepo && hasGoal
    ? "Hệ thống đã có đủ repo và mục tiêu để tạo hoặc tiếp tục ticket. Tiếp theo, supervisor sẽ dựa vào issue boundary và rule dừng để quyết định cách loop."
    : "Supervisor nhiều khả năng sẽ phải hỏi lại sớm vì prompt chưa đủ repo hoặc mục tiêu để route an toàn.";

  return {
    band,
    scoreTotal,
    scoreBreakdown,
    rubric,
    systemInterpretation,
    rewriteSuggestions: rewriteSuggestions.slice(0, 3),
  } satisfies PromptEvaluation;
}
