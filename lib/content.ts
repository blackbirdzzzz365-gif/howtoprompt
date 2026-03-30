import {
  missionSchema,
  pathSchema,
  quickRefSchema,
  scenarioSchema,
  type LearningPath,
  type Mission,
  type QuickRef,
  type Scenario,
} from "@/lib/content-schema";

const rawPaths = [
  {
    slug: "fast-start",
    title: "Bắt đầu trong 5 phút",
    summary: "Dành cho lúc bạn cần viết prompt và vào việc ngay.",
    recommendedFor: "owner muốn dispatch nhanh và có thẻ nhắc để dùng liền.",
    primaryMissionSlugs: ["prompt-formula", "continue-or-new-issue", "choose-right-bot"],
  },
  {
    slug: "deep-dive",
    title: "Học bài bản",
    summary: "Đi trọn lộ trình để hiểu tư duy, hidden system và cách vận hành.",
    recommendedFor: "người mới hoặc khi bạn muốn onboard lại workflow cho cả team.",
    primaryMissionSlugs: [
      "one-section-one-issue",
      "prompt-formula",
      "continue-or-new-issue",
      "choose-right-bot",
      "hidden-system",
      "blockers-and-auth",
    ],
  },
  {
    slug: "troubleshoot",
    title: "Gỡ rối nhanh",
    summary: "Tập trung vào blocker, xác thực, ranh giới issue và stop rules.",
    recommendedFor: "operator cần xử lý tình huống bất thường mà không phải đọc lại toàn bộ guide.",
    primaryMissionSlugs: ["continue-or-new-issue", "hidden-system", "blockers-and-auth"],
  },
] as const;

const rawQuickRefs = [
  {
    id: "qr-section-boundary",
    title: "Một section, một issue",
    summary: "Section giữ bối cảnh công việc. Trộn nhiều issue sẽ làm context file phình sai hướng.",
    bullets: [
      "Cùng section và cùng vấn đề thì tiếp tục context cũ.",
      "Đổi repo, đổi outcome chính hoặc đổi vấn đề lớn thì mở issue mới.",
      "Nếu chưa chắc, hãy nói rõ: 'cùng issue này' hoặc 'đây là issue mới'.",
    ],
    unlocksFromMission: "one-section-one-issue",
  },
  {
    id: "qr-prompt-formula",
    title: "Công thức prompt 4 dòng",
    summary: "Một prompt tốt nên có bot, repo, mục tiêu và rule để hệ thống hiểu ngay.",
    bullets: [
      "@bot hãy trò chuyện với Codex và xử lý việc này.",
      "Repo: <repo>",
      "Mục tiêu: <goal>",
      "Rule: chỉ hỏi tôi nếu thật sự bị chặn.",
    ],
    unlocksFromMission: "prompt-formula",
  },
  {
    id: "qr-issue-choice",
    title: "Tiếp tục hay mở issue mới",
    summary: "Nói rõ từ đầu để supervisor resume đúng ticket thay vì đoán sai ý bạn.",
    bullets: [
      "Muốn tiếp tục issue cũ: nói 'cùng issue này'.",
      "Muốn tách việc mới: nói 'đây là issue mới'.",
      "Nếu không nói rõ, hệ thống thường sẽ giữ context hiện tại.",
    ],
    unlocksFromMission: "continue-or-new-issue",
  },
  {
    id: "qr-bot-fit",
    title: "Chọn bot cho đúng việc",
    summary: "Bot phù hợp sẽ giúp prompt có điểm đến đúng ngay từ đầu.",
    bullets: [
      "linux_main: runtime, deploy, điều phối, integration.",
      "lavis_linux: phân tích, review, specification, root cause.",
      "gaubot: implementation slice, chỉnh code, fix kỹ thuật.",
    ],
    unlocksFromMission: "choose-right-bot",
  },
  {
    id: "qr-hidden-system",
    title: "Bản đồ hidden system",
    summary: "Một prompt rõ ràng sẽ đi qua section, ticket, context rồi vào supervisor loop mạch lạc.",
    bullets: [
      "Section giữ bối cảnh công việc.",
      "Ticket là định danh kỹ thuật để resume.",
      "Context file lưu goal, facts, decisions, evidence và bước tiếp theo.",
    ],
    unlocksFromMission: "hidden-system",
  },
  {
    id: "qr-stop-rules",
    title: "Blocker và auth flow",
    summary: "Bot không nên hỏi non. Chỉ hỏi lại khi thật sự bị chặn hoặc cần quyết định từ owner.",
    bullets: [
      "Auth hoặc rate limit đi theo flow pair-device auth + alert + auto-probe/auto-resume.",
      "Rule tốt: 'chỉ hỏi tôi nếu thật sự bị chặn'.",
      "Bot nên hỏi khi thiếu repo, thiếu mục tiêu, cần credential hoặc cần business decision.",
    ],
    unlocksFromMission: "blockers-and-auth",
  },
] as const;

const rawMissions = [
  {
    slug: "one-section-one-issue",
    order: 1,
    title: "Một section, một issue",
    tagline: "Giữ ranh giới công việc rõ ngay từ đầu để tránh lẫn context.",
    duration: "4-6 phút",
    outcome: "Biết khi nào nên tiếp tục việc cũ và khi nào nên mở issue mới.",
    focus: "mental-model",
    quickRefId: "qr-section-boundary",
    practiceMode: "simulator",
    lessonBlocks: [
      {
        title: "Tư duy cốt lõi",
        body: "Section hoặc topic trên Telegram là khung giữ bối cảnh của một việc. Ticket giữ định danh kỹ thuật. Context file giữ linh hồn của task.",
        bullets: [
          "Mở section mới thường tương đương mở vấn đề mới.",
          "Nhắn tiếp trong section cũ thường có nghĩa là tiếp tục issue cũ.",
          "Nếu không nói rõ issue mới, bot có xu hướng giữ context hiện tại.",
        ],
      },
      {
        title: "Lỗi thường gặp",
        body: "Sai lầm phổ biến nhất là trộn hai vấn đề vào cùng một section rồi kỳ vọng supervisor tự hiểu đúng ý bạn.",
        bullets: [
          "Vừa fix deploy vừa review auth flow trong cùng một prompt là cách mở đầu dễ lệch hướng.",
          "Nếu buộc phải ở cùng section, hãy nói rõ bạn đang ưu tiên việc nào.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 1, 3, 4, 8, 11",
      "Scenario của mission này nhấn mạnh hậu quả vận hành khi context bị lệch.",
    ],
  },
  {
    slug: "prompt-formula",
    order: 2,
    title: "Công thức prompt 4 dòng",
    tagline: "Một khung ngắn gọn để prompt an toàn, rõ việc và dễ dispatch.",
    duration: "5-7 phút",
    outcome: "Viết được prompt đạt ít nhất mức Good trong Prompt Lab.",
    focus: "prompting",
    quickRefId: "qr-prompt-formula",
    practiceMode: "prompt-lab",
    lessonBlocks: [
      {
        title: "Khung prompt cơ bản",
        body: "Một prompt tốt nên nói rõ bạn muốn bot phối hợp với Codex, đang làm trên repo nào, mục tiêu cần chốt là gì và rule dừng ra sao.",
        bullets: [
          "Dòng 1: bot + hãy trò chuyện với Codex",
          "Dòng 2: Repo",
          "Dòng 3: Mục tiêu",
          "Dòng 4: Rule",
        ],
      },
      {
        title: "Vì sao prompt mơ hồ dễ hỏng",
        body: "Nếu thiếu repo, thiếu goal hoặc thiếu rule, supervisor sẽ phải đoán phạm vi nên dễ hỏi lại quá sớm hoặc route sai.",
        bullets: [
          "Những câu như 'check giúp tôi' gần như không đủ để vào việc.",
          "Rule rõ giúp supervisor biết khi nào được tự loop và khi nào phải dừng lại.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 4, 5, 11, 12",
      "Prompt Lab chấm dựa trên clarity, context safety, operational control và bot fit.",
    ],
  },
  {
    slug: "continue-or-new-issue",
    order: 3,
    title: "Tiếp tục hay mở issue mới",
    tagline: "Nói rõ boundary để ticket và context không bị lệch hướng.",
    duration: "4-5 phút",
    outcome: "Biết cách viết prompt để resume đúng ticket hoặc mở task mới.",
    focus: "context-safety",
    quickRefId: "qr-issue-choice",
    practiceMode: "mixed",
    lessonBlocks: [
      {
        title: "Khi nào nên tiếp tục",
        body: "Nếu vấn đề và outcome chưa đổi, bạn nên tiếp tục trong cùng section và nói rõ 'cùng issue này'.",
        bullets: [
          "Supervisor sẽ ưu tiên resume thread cũ.",
          "Nếu thread cũ không còn, hệ thống vẫn có thể dựng lại từ context file.",
        ],
      },
      {
        title: "Khi nào nên tách việc",
        body: "Nếu đổi repo, đổi outcome chính hoặc chuyển sang một vấn đề lớn khác, bạn nên nói rõ 'đây là issue mới'.",
        bullets: [
          "Dù còn ở cùng section, bạn vẫn cần viết rõ đây là việc mới.",
          "Nếu không nói rõ, bot dễ hiểu nhầm là bạn vẫn đang tiếp tục việc cũ.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 4.2, 4.6, 8, 11",
      "Simulator của mission này cho thấy hậu quả khi ticket resume nhầm context.",
    ],
  },
  {
    slug: "choose-right-bot",
    order: 4,
    title: "Chọn đúng bot",
    tagline: "Đúng bot thì đúng nhịp làm việc, đúng cách nghĩ và đúng đầu ra.",
    duration: "3-4 phút",
    outcome: "Ghép đúng loại task với linux_main, lavis_linux và gaubot.",
    focus: "routing",
    quickRefId: "qr-bot-fit",
    practiceMode: "mixed",
    lessonBlocks: [
      {
        title: "Bản đồ năng lực",
        body: "Cả ba bot đều dùng ticket và shared context, nhưng mỗi bot hợp nhất với một kiểu bài toán khác nhau.",
        bullets: [
          "linux_main: runtime, điều phối, deploy, integration.",
          "lavis_linux: phân tích, review, root cause, specification.",
          "gaubot: implementation slice và chỉnh code chi tiết.",
        ],
      },
      {
        title: "Cách route nhanh",
        body: "Task phân tích sâu hoặc review kiến trúc thường hợp với lavis_linux. Task fix code thường hợp với gaubot. Task cần điều phối runtime thường hợp với linux_main.",
        bullets: [
          "Dùng sai bot vẫn có thể chạy, nhưng đầu ra dễ lệch phong cách và pace mong muốn.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 9, 12",
      "Bot fit là một trục chấm điểm riêng trong Prompt Lab.",
    ],
  },
  {
    slug: "hidden-system",
    order: 5,
    title: "Cách hệ thống vận hành",
    tagline: "Hiểu supervisor loop, ticket và context file đang phối hợp với nhau ra sao.",
    duration: "6-8 phút",
    outcome: "Tin vào hidden system vì đã thấy rõ các trạng thái bên trong.",
    focus: "simulation",
    quickRefId: "qr-hidden-system",
    practiceMode: "simulator",
    lessonBlocks: [
      {
        title: "Các trạng thái chính",
        body: "Khi prompt được dispatch, hệ thống sẽ xác định section, tìm task đang mở, tạo hoặc resume ticket, cập nhật context rồi loop theo kết quả DONE, PARTIAL hoặc BLOCKED.",
        bullets: [
          "Section giữ bối cảnh.",
          "Ticket giúp resume đúng thread.",
          "Context file cho phép khôi phục task khi cần.",
        ],
      },
      {
        title: "Hậu quả nhìn thấy được",
        body: "Prompt rõ sẽ dẫn tới timeline gọn gàng. Prompt mơ hồ dễ dẫn tới NEEDS_INPUT, route sai hoặc context drift.",
        bullets: [
          "Simulator không chỉ giải thích bằng lời mà cho bạn thấy state đổi theo từng lựa chọn.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 2, 3, 6, 14",
      "Simulator là cơ chế trung tâm của CP4.",
    ],
  },
  {
    slug: "blockers-and-auth",
    order: 6,
    title: "Blocker, xác thực và rate limit",
    tagline: "Biết lúc nào để bot tự làm tiếp và lúc nào owner cần can thiệp.",
    duration: "5-6 phút",
    outcome: "Ghi nhớ đúng stop rules và auth flow đã chốt.",
    focus: "operations",
    quickRefId: "qr-stop-rules",
    practiceMode: "simulator",
    lessonBlocks: [
      {
        title: "Khi nào bot nên hỏi lại",
        body: "Bot nên hỏi khi thiếu repo, thiếu mục tiêu, cần business decision, cần credential hoặc đã thật sự rơi vào BLOCKED hay NEEDS_INPUT.",
        bullets: [
          "Không nên hỏi lại cho những bước đọc file hay debug nhỏ mà bot có thể tự xử lý.",
        ],
      },
      {
        title: "Auth và rate limit",
        body: "Policy đã chốt là pair-device auth + Telegram alert + auto-probe/auto-resume, thay vì âm thầm xoay credential.",
        bullets: [
          "Rule rõ giúp owner biết lúc nào cần vào hỗ trợ.",
          "Niềm tin đến từ việc hành vi của hệ thống dễ hiểu và có thể dự đoán.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 7, 10, 11, 13",
      "Scenario auth/rate limit là cửa kiểm tra cho phần operations.",
    ],
  },
] as const;

const rawScenarios = [
  {
    id: "scenario-issue-boundary",
    missionSlug: "continue-or-new-issue",
    title: "Bài tập về ranh giới issue",
    summary: "Bạn đang ở section deploy nhưng muốn review auth flow cho một repo khác.",
    steps: [
      {
        id: "start",
        prompt:
          "Bạn đang ở section cũ và muốn giao một việc mới: 'review auth flow cho repo social-listening-v3'. Bạn nên viết yêu cầu thế nào?",
        helper: "Chọn cách giữ context an toàn nhất cho hệ thống.",
        choices: [
          {
            id: "same-issue",
            label: "Cùng issue này, review auth flow cho repo social-listening-v3",
            feedback: "Chưa đúng.",
            explanation:
              "Bạn đang tái sử dụng issue cũ cho một outcome mới. Context file rất dễ lệch hướng và supervisor có thể resume nhầm thread.",
            isCorrect: false,
            timelineState: [
              {
                title: "Section cũ",
                state: "Nguy cơ drift context",
                description: "Supervisor hiểu đây vẫn là issue deploy trước đó.",
                tone: "danger",
              },
              {
                title: "Ticket",
                state: "Resume nhầm thread",
                description: "Việc cũ được ưu tiên thay vì task auth mới mà bạn đang muốn giao.",
                tone: "danger",
              },
            ],
          },
          {
            id: "new-issue",
            label:
              "Đây là issue mới, không liên quan issue trước. Repo: social-listening-v3. Mục tiêu: review auth flow.",
            feedback: "Đúng rồi.",
            explanation:
              "Bạn đã nói rõ boundary và repo mới. Supervisor có thể tạo ticket mới hoặc route lại bối cảnh một cách an toàn.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Bối cảnh section",
                state: "Được đặt lại",
                description: "Prompt nêu rõ đây là issue mới nên hidden system đổi bối cảnh an toàn.",
                tone: "success",
              },
              {
                title: "Ticket",
                state: "Tạo ticket mới",
                description: "Supervisor mở một ticket mới và khởi tạo context file mới cho việc này.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-bot-fit",
    missionSlug: "choose-right-bot",
    title: "Bài tập chọn bot",
    summary: "Bạn cần phân tích kiến trúc và chốt 3 root cause trước khi implement.",
    steps: [
      {
        id: "bot-step",
        prompt: "Task này nên giao cho bot nào để có đúng cách nghĩ và nhịp làm việc nhất?",
        helper: "Hãy chọn bot phù hợp nhất với một bài toán thiên về phân tích.",
        choices: [
          {
            id: "linux-main",
            label: "linux_main",
            feedback: "Chưa tối ưu.",
            explanation:
              "linux_main vẫn làm được, nhưng với bài toán phân tích sâu và chốt spec thì lavis_linux thường hợp hơn.",
            isCorrect: false,
            timelineState: [
              {
                title: "Routing",
                state: "Hơi lệch vai trò",
                description: "Task bị đưa sang bot có xu hướng điều phối nhiều hơn là phân tích chuyên sâu.",
                tone: "warn",
              },
            ],
          },
          {
            id: "lavis-linux",
            label: "lavis_linux",
            feedback: "Đúng rồi.",
            explanation:
              "Bài toán root cause, review và specification hợp nhất với lavis_linux theo guide section 9.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Routing",
                state: "Đúng bot phân tích",
                description: "Prompt được đưa tới bot phù hợp cho root cause và spec review.",
                tone: "success",
              },
            ],
          },
          {
            id: "gaubot",
            label: "gaubot",
            feedback: "Sai trọng tâm.",
            explanation:
              "gaubot hợp hơn cho implementation slice và code-level execution, không phải review kiến trúc ưu tiên.",
            isCorrect: false,
            timelineState: [
              {
                title: "Routing",
                state: "Thiên về execution",
                description: "Task dễ bị kéo sang implement trước khi phần phân tích được chốt.",
                tone: "danger",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-hidden-system",
    missionSlug: "hidden-system",
    title: "Mô phỏng supervisor loop",
    summary: "Prompt đã có repo, mục tiêu và rule rõ ràng. Hệ thống sẽ xử lý ra sao?",
    steps: [
      {
        id: "dispatch",
        prompt: "Khi prompt đủ thông tin và có rule 'chỉ hỏi tôi nếu thật sự bị chặn', kết quả hợp lý nhất là gì?",
        helper: "Hãy nghĩ theo chuỗi section -> ticket -> context -> loop.",
        choices: [
          {
            id: "instant-answer",
            label: "Bot trả lời ngay, không tạo ticket và không có context file",
            feedback: "Chưa đúng.",
            explanation:
              "Guide section 6 nói rõ hệ thống sẽ tạo hoặc resume ticket, cập nhật context file rồi mới loop cho tới khi xong hoặc thật sự blocked.",
            isCorrect: false,
            timelineState: [
              {
                title: "Dispatch",
                state: "Phản hồi quá sớm",
                description: "Bot trả lời non và bỏ qua hidden system ở phía sau.",
                tone: "danger",
              },
            ],
          },
          {
            id: "loop",
            label: "Supervisor xác định section, tạo hoặc resume ticket, cập nhật context file rồi tiếp tục loop",
            feedback: "Chính xác.",
            explanation:
              "Đây là flow hidden system đã chốt. Nếu kết quả là PARTIAL, supervisor vẫn có thể tiếp tục vòng sau.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Section",
                state: "Được gắn bối cảnh",
                description: "Công việc được đặt vào đúng section hiện tại.",
                tone: "success",
              },
              {
                title: "Ticket",
                state: "Tạo mới hoặc resume",
                description: "Supervisor tìm task đang mở hoặc tạo ticket mới nếu cần.",
                tone: "success",
              },
              {
                title: "Context file",
                state: "Được cập nhật",
                description: "Goal, facts, decisions và next step được ghi lại để loop tiếp.",
                tone: "success",
              },
              {
                title: "Loop",
                state: "Tiếp tục cho đến khi xong",
                description: "DONE thì tóm tắt, PARTIAL thì làm tiếp, BLOCKED thì hỏi owner.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-blocker-auth",
    missionSlug: "blockers-and-auth",
    title: "Xử lý auth và blocker",
    summary: "Codex chạm rate limit trong lúc supervisor đang loop.",
    steps: [
      {
        id: "auth-step",
        prompt: "Hệ thống nên xử lý thế nào để hành vi vừa dễ hiểu vừa đáng tin?",
        helper: "Chọn đúng policy đã chốt trong guide.",
        choices: [
          {
            id: "rotate-key",
            label: "Âm thầm xoay API key khác để tiếp tục",
            feedback: "Sai policy.",
            explanation:
              "Guide đã chốt không tự xoay credential trong loop. Cách đó làm owner mất niềm tin vào account đang được dùng.",
            isCorrect: false,
            timelineState: [
              {
                title: "Auth flow",
                state: "Thiếu minh bạch",
                description: "Credential bị đổi ngầm nên hành vi của hệ thống trở nên khó đoán.",
                tone: "danger",
              },
            ],
          },
          {
            id: "pair-device",
            label: "Chuyển sang pair-device auth, gửi alert, rồi để auto-probe và auto-resume",
            feedback: "Đúng rồi.",
            explanation:
              "Đây là flow đã chốt: pair-device auth + Telegram alert + auto-probe/auto-resume.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Sự cố",
                state: "Bị rate limit",
                description: "Supervisor đánh dấu đây là incident về auth hoặc quota.",
                tone: "warn",
              },
              {
                title: "Owner",
                state: "Xác thực lại",
                description: "Owner nhận alert và auth lại bằng thiết bị phù hợp.",
                tone: "success",
              },
              {
                title: "Phục hồi",
                state: "Auto probe rồi auto resume",
                description: "Hệ thống kiểm tra lại sức khỏe và tiếp tục task khi đã ổn định.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

function validate<T>(items: readonly unknown[], schema: { parse: (value: unknown) => T }) {
  return items.map((item) => schema.parse(item));
}

export const learningPaths: LearningPath[] = validate(rawPaths, pathSchema);
export const missions: Mission[] = validate(rawMissions, missionSchema).sort(
  (left, right) => left.order - right.order,
);
export const quickRefs: QuickRef[] = validate(rawQuickRefs, quickRefSchema);
export const scenarios: Scenario[] = validate(rawScenarios, scenarioSchema);

export function getMission(slug: string) {
  return missions.find((mission) => mission.slug === slug) ?? null;
}

export function getQuickRef(id: string) {
  return quickRefs.find((quickRef) => quickRef.id === id) ?? null;
}

export function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id) ?? null;
}

export function getScenariosForMission(missionSlug: string) {
  return scenarios.filter((scenario) => scenario.missionSlug === missionSlug);
}

export function getPath(slug: string) {
  return learningPaths.find((path) => path.slug === slug) ?? null;
}
