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
  linux_main: ["audit", "production", "runtime", "deploy", "revalidate", "integration", "report", "checkpoint verdict"],
  lavis_linux: ["analysis", "phan tich", "review", "spec", "root cause", "kien truc", "architecture", "new-phase", "contained-fix"],
  gaubot: ["implement", "fix", "code", "branch", "checkpoint", "candidate summary", "patch", "build", "executor"],
};

function scoreBotFit(selectedBot: string, normalizedPrompt: string) {
  if (!selectedBot) {
    return {
      score: 10,
      status: "warn" as const,
      message: "Chua chon bot, nen Prompt Lab khong the cham bot fit day du.",
    };
  }

  const hints = BOT_HINTS[selectedBot] ?? [];
  const matches = hints.filter((hint) => normalizedPrompt.includes(hint));

  if (matches.length >= 1) {
    return {
      score: 24,
      status: "pass" as const,
      message: `Bot ${selectedBot} co dau hieu phu hop voi task text hien tai.`,
    };
  }

  return {
    score: 8,
    status: "warn" as const,
    message: `Task text chua goi len kha nang cot loi cua ${selectedBot}. Kiem tra lai bot routing.`,
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
      message: "Prompt noi ro muon bot tro chuyen voi Codex.",
    });
  } else {
    rubric.push({
      id: "codex-directive",
      status: "fail",
      message: "Chua noi ro muon bot tro chuyen voi Codex.",
    });
    rewriteSuggestions.push("Them dong mo dau: '@bot hay tro chuyen voi codex va xu ly viec nay.'");
  }

  if (hasRepo) {
    clarity += 18;
    rubric.push({
      id: "repo",
      status: "pass",
      message: "Prompt da co repo de hidden system khong phai doan pham vi.",
    });
  } else {
    rubric.push({
      id: "repo",
      status: "fail",
      message: "Thieu repo. Day la ly do pho bien khien supervisor hoi nguoc som.",
    });
    rewriteSuggestions.push("Them dong 'Repo: <ten-repo>' de dispatcher co diem den ro.");
  }

  if (hasGoal) {
    clarity += 18;
    rubric.push({
      id: "goal",
      status: "pass",
      message: "Prompt da noi ro outcome can chot.",
    });
  } else {
    rubric.push({
      id: "goal",
      status: "fail",
      message: "Muc tieu chua ro. Prompt de roi vao vung 'check giup toi'.",
    });
    rewriteSuggestions.push("Them 'Muc tieu: <goal cu the, co diem dung ro rang>'.");
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
      message: "Prompt vua noi 'cung issue nay' vua noi 'issue moi', context se bi conflict.",
    });
    rewriteSuggestions.push("Chi giu mot trong hai: 'cung issue nay' hoac 'day la issue moi'.");
  } else if (mentionsContinueIssue || mentionsNewIssue) {
    rubric.push({
      id: "context-safety",
      status: "pass",
      message: "Prompt da noi ro issue boundary, giam nguy co context drift.",
    });
  } else {
    rubric.push({
      id: "context-safety",
      status: "warn",
      message: "Prompt chua noi ro issue moi hay issue cu. O section cu, day co the gay resume nham.",
    });
    rewriteSuggestions.push("Neu dang tiep tuc viec cu, them 'cung issue nay'. Neu mo viec moi, them 'day la issue moi'.");
  }

  const operationalControl = hasRule ? 26 : 8;
  if (hasRule) {
    rubric.push({
      id: "rule",
      status: "pass",
      message: "Prompt da co stop rule/autonomy rule cho supervisor loop.",
    });
  } else {
    rubric.push({
      id: "rule",
      status: "warn",
      message: "Thieu rule dung. Bot de bao non hon vi khong biet khi nao duoc tiep tuc.",
    });
    rewriteSuggestions.push("Them 'Rule: chi hoi toi neu blocked that hoac can business decision'.");
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
    ? "He thong co du scope de tao hoac resume ticket, nhung van se xem issue boundary, gate hien tai va stop rule truoc khi loop."
    : "Supervisor co kha nang hoi lai som vi prompt chua du repo/goal de route an toan.";

  return {
    band,
    scoreTotal,
    scoreBreakdown,
    rubric,
    systemInterpretation,
    rewriteSuggestions: rewriteSuggestions.slice(0, 3),
  } satisfies PromptEvaluation;
}
