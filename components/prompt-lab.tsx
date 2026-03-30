"use client";

import { useState } from "react";
import { useAcademyProgress } from "@/components/app-provider";
import type { PromptEvaluation } from "@/lib/evaluate-prompt";

const starterPrompts = [
  "@linux_mainbot hãy trò chuyện với Codex và xử lý việc này.\nRepo: dashboard-coordinate\nMục tiêu: tìm nguyên nhân route status bị lỗi và sửa đến khi kiểm tra local pass\nRule: chỉ hỏi tôi nếu thật sự bị chặn",
  "@gaubot hãy trò chuyện với Codex và triển khai bản sửa này.\nRepo: social-listening-v3\nMục tiêu: sửa docker-compose để local VM chạy được\nRule: tiếp tục xử lý cho đến khi có bằng chứng rõ ràng",
];

const bandLabels: Record<PromptEvaluation["band"], string> = {
  Unsafe: "Chưa an toàn",
  "Needs work": "Cần bổ sung",
  Good: "Tốt",
  Excellent: "Rất tốt",
};

const scoreLabels: Record<keyof PromptEvaluation["scoreBreakdown"], string> = {
  clarity: "Độ rõ ràng",
  contextSafety: "An toàn ngữ cảnh",
  operationalControl: "Quy tắc vận hành",
  botFit: "Độ phù hợp của bot",
};

export function PromptLab() {
  const { completeMission, recordEvent, userId } = useAcademyProgress();
  const [selectedBot, setSelectedBot] = useState("linux_main");
  const [promptText, setPromptText] = useState(starterPrompts[0]);
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [status, setStatus] = useState("Nhập prompt rồi bấm Chấm prompt để xem góp ý.");
  const [busy, setBusy] = useState(false);

  async function handleEvaluate() {
    setBusy(true);
    setStatus("Đang chấm prompt...");

    const response = await fetch("/api/attempts/prompt-evaluation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        missionSlug: "prompt-formula",
        promptText,
        selectedBot,
      }),
    });

    const payload = (await response.json()) as {
      evaluation: PromptEvaluation;
    };

    setEvaluation(payload.evaluation);
    setBusy(false);
    setStatus("Prompt đã được chấm. Xem góp ý ở khung bên phải.");

    await recordEvent("prompt_evaluated", {
      selectedBot,
      band: payload.evaluation.band,
    });
  }

  async function handleSendReady() {
    await completeMission("prompt-formula");
    setStatus("Đã đánh dấu hoàn thành nhiệm vụ Công thức prompt 4 dòng.");
  }

  return (
    <div className="detail-grid">
      <section className="panel section-block panel-strong">
        <p className="eyebrow">Prompt Lab</p>
        <h1 className="section-title">Thử trước khi gửi prompt thật</h1>
        <p className="section-copy">
          Prompt Lab chấm theo 4 tiêu chí: độ rõ ràng, an toàn ngữ cảnh, quy tắc vận hành và độ phù hợp của bot.
          Mục tiêu của bạn là đưa prompt lên ít nhất mức <strong>Tốt</strong>.
        </p>

        <div className="form-grid" style={{ marginTop: "22px" }}>
          <div className="field">
            <label htmlFor="bot">Bot phụ trách</label>
            <select
              id="bot"
              className="select"
              value={selectedBot}
              onChange={(event) => setSelectedBot(event.target.value)}
            >
              <option value="linux_main">linux_main</option>
              <option value="lavis_linux">lavis_linux</option>
              <option value="gaubot">gaubot</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="prompt">Nội dung prompt</label>
            <textarea
              id="prompt"
              className="textarea"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
            />
          </div>

          <div className="detail-actions">
            <button type="button" className="button-primary" onClick={handleEvaluate} disabled={busy}>
              {busy ? "Đang chấm..." : "Chấm prompt"}
            </button>
            <button
              type="button"
              className="button-ghost"
              onClick={() => setPromptText(starterPrompts[1])}
            >
              Tải ví dụ triển khai
            </button>
          </div>
          <p className="status-message">{status}</p>
        </div>
      </section>

      <aside className="tool-stack sticky-console">
        <section className="tool-card">
          <p className="micro-label">Mẫu tham khảo</p>
          <div className="list-stack">
            <button type="button" className="button-secondary" onClick={() => setPromptText(starterPrompts[0])}>
              Tải ví dụ phân tích
            </button>
            <button type="button" className="button-secondary" onClick={() => setPromptText(starterPrompts[1])}>
              Tải ví dụ triển khai
            </button>
          </div>
        </section>

        <section className="tool-card">
          <p className="micro-label">Tiêu chí chấm</p>
          <ul className="list-copy">
            <li>Độ rõ ràng: đã nêu repo, mục tiêu và chỉ dẫn phối hợp với Codex hay chưa.</li>
            <li>An toàn ngữ cảnh: đã nói rõ đang tiếp tục issue cũ hay mở issue mới hay chưa.</li>
            <li>Quy tắc vận hành: đã có stop rule đủ rõ để supervisor tự loop hay chưa.</li>
            <li>Độ phù hợp của bot: bot bạn chọn có đúng với loại việc đang giao hay không.</li>
          </ul>
        </section>

        {evaluation ? (
          <section className="tool-card">
            <div className="score-band" data-band={evaluation.band}>
              <strong>{bandLabels[evaluation.band]}</strong>
              <span>{evaluation.scoreTotal}/100</span>
            </div>

            <div className="score-grid">
              {Object.entries(evaluation.scoreBreakdown).map(([label, value]) => (
                <div className="score-row" key={label}>
                  <div className="detail-actions">
                    <span>{scoreLabels[label as keyof PromptEvaluation["scoreBreakdown"]]}</span>
                    <span>{value}</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rubric-list">
              {evaluation.rubric.map((item) => (
                <div key={item.id} className="rubric-item" data-status={item.status}>
                  <p style={{ fontWeight: 600 }}>{item.id}</p>
                  <p className="muted-copy">{item.message}</p>
                </div>
              ))}
            </div>

            <div className="tool-card" style={{ marginTop: "14px", padding: 0, border: "none", background: "transparent" }}>
              <p className="micro-label">Hệ thống sẽ hiểu như sau</p>
              <p className="muted-copy" style={{ marginTop: "8px" }}>
                {evaluation.systemInterpretation}
              </p>
              {evaluation.rewriteSuggestions.length > 0 ? (
                <div className="suggestion-list">
                  {evaluation.rewriteSuggestions.map((suggestion) => (
                    <div key={suggestion} className="timeline-card" data-tone="warn">
                      {suggestion}
                    </div>
                  ))}
                </div>
              ) : null}
              {(evaluation.band === "Good" || evaluation.band === "Excellent") && (
                <button type="button" className="button-primary" style={{ marginTop: "16px" }} onClick={handleSendReady}>
                  Đánh dấu hoàn thành nhiệm vụ
                </button>
              )}
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
