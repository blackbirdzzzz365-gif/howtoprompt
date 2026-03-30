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
    title: "Bat dau trong 5 phut",
    summary: "Dung cho luc ban can prompt dung ngay bay gio.",
    recommendedFor: "owner can dispatch nhanh va muon co quick ref som.",
    primaryMissionSlugs: ["prompt-formula", "continue-or-new-issue", "choose-right-bot"],
  },
  {
    slug: "deep-dive",
    title: "Hoc day du",
    summary: "Di qua full mission map de nho mental model va hidden system.",
    recommendedFor: "nguoi moi hoac khi can onboard lai workflow cho team.",
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
    title: "Troubleshoot nhanh",
    summary: "Tap trung vao blocker, auth, issue boundary va stop rules.",
    recommendedFor: "operator can giai quyet tinh huong bat thuong.",
    primaryMissionSlugs: ["continue-or-new-issue", "hidden-system", "blockers-and-auth"],
  },
] as const;

const rawQuickRefs = [
  {
    id: "qr-section-boundary",
    title: "One section, one issue",
    summary: "Section la boi canh cuoc viec. Tron issue se lam context file phinh sai huong.",
    bullets: [
      "Cung section + cung van de = tiep tuc context cu.",
      "Doi repo, doi outcome, doi van de lon = mo issue moi.",
      "Neu khong chac, noi ro 'cung issue nay' hoac 'day la issue moi'.",
    ],
    unlocksFromMission: "one-section-one-issue",
  },
  {
    id: "qr-prompt-formula",
    title: "Cong thuc 4 dong",
    summary: "Mot prompt tot phai co bot + Codex, repo, muc tieu, rule.",
    bullets: [
      "@bot hay tro chuyen voi codex va xu ly viec nay.",
      "Repo: <repo>",
      "Muc tieu: <goal>",
      "Rule: chi hoi toi neu blocked that.",
    ],
    unlocksFromMission: "prompt-formula",
  },
  {
    id: "qr-issue-choice",
    title: "Issue moi hay issue cu",
    summary: "Noi ro de supervisor resume dung ticket thay vi doan sai y.",
    bullets: [
      "Muon tiep tuc issue cu: noi 'cung issue nay'.",
      "Muon tach viec moi: noi 'day la issue moi'.",
      "Khong noi ro -> he thong co xu huong giu context cu.",
    ],
    unlocksFromMission: "continue-or-new-issue",
  },
  {
    id: "qr-bot-fit",
    title: "Bot fit nhanh",
    summary: "Chon dung bot giup prompt co diem den dung ngay tu dau.",
    bullets: [
      "linux_main: runtime, deploy, dieu phoi, integration.",
      "lavis_linux: analysis, review, specification.",
      "gaubot: implementation slice, code-level execution.",
    ],
    unlocksFromMission: "choose-right-bot",
  },
  {
    id: "qr-hidden-system",
    title: "Hidden system map",
    summary: "Prompt dung se dan den section -> ticket -> context -> supervisor loop ro rang.",
    bullets: [
      "Section giu boi canh cuoc viec.",
      "Ticket la identity ky thuat de resume.",
      "Context file giu goal, facts, decisions, evidence, next step.",
    ],
    unlocksFromMission: "hidden-system",
  },
  {
    id: "qr-stop-rules",
    title: "Blocker va auth flow",
    summary: "Bot khong nen bao non. Chi hoi nguoc khi blocked that hoac can business decision.",
    bullets: [
      "Auth/rate limit di theo pair-device auth + alert + auto-probe/auto-resume.",
      "Rule tot: 'chi hoi toi neu blocked that'.",
      "Bot nen hoi khi thieu repo, mo ho muc tieu, can credential, hoac can business decision.",
    ],
    unlocksFromMission: "blockers-and-auth",
  },
] as const;

const rawMissions = [
  {
    slug: "one-section-one-issue",
    order: 1,
    title: "One Section, One Issue",
    tagline: "Khoa context tu dau de khong vo tinh tron viec.",
    duration: "4-6 phut",
    outcome: "Biet khi nao nen tiep tuc va khi nao nen tach issue moi.",
    focus: "mental-model",
    quickRefId: "qr-section-boundary",
    practiceMode: "simulator",
    lessonBlocks: [
      {
        title: "Mental model",
        body: "Section/topic Telegram la khung giu boi canh cua mot cuoc viec. Ticket giu identity ky thuat. Context file giu linh hon cua task.",
        bullets: [
          "Mo section moi = mo van de moi.",
          "Nhan tiep trong section cu = tiep tuc issue cu.",
          "Khong noi ro issue moi -> bot co xu huong giu context cu.",
        ],
      },
      {
        title: "Loi user hay gap",
        body: "Sai lam pho bien nhat la tron hai van de vao mot section va ky vong supervisor tu hieu dung y ban.",
        bullets: [
          "Fix deploy va review auth flow cung luc la prompt xau.",
          "Hay noi ro uu tien neu bat buoc giu cung section.",
        ],
      },
    ],
    evidenceBullets: [
      "Guide section 1, 3, 4, 8, 11",
      "Scenario mission phai day consequence operational, khong chi day dinh nghia.",
    ],
  },
  {
    slug: "prompt-formula",
    order: 2,
    title: "Prompt Formula",
    tagline: "Cong thuc 4 dong de prompt an toan va de dispatch.",
    duration: "5-7 phut",
    outcome: "Viet duoc prompt dat nguong Good hoac Excellent.",
    focus: "prompting",
    quickRefId: "qr-prompt-formula",
    practiceMode: "prompt-lab",
    lessonBlocks: [
      {
        title: "Bo khung prompt",
        body: "Prompt tot can noi ro muon bot tro chuyen voi codex, repo nao, muc tieu cuoi, va quy tac dung/hoi nguoc.",
        bullets: [
          "Dong 1: bot + hay tro chuyen voi codex",
          "Dong 2: Repo",
          "Dong 3: Muc tieu",
          "Dong 4: Rule",
        ],
      },
      {
        title: "Hau qua prompt mo ho",
        body: "Neu khong noi repo, goal hoac rule dung, bot se phai doan scope va de bao non hon.",
        bullets: [
          "Prompt 'check giup toi' la prompt kem.",
          "Rule ro giup supervisor biet khi nao duoc tu loop.",
        ],
      },
    ],
    evidenceBullets: ["Guide section 4, 5, 11, 12", "Prompt Lab cham theo clarity + operational control."],
  },
  {
    slug: "continue-or-new-issue",
    order: 3,
    title: "Continue Hay Issue Moi",
    tagline: "Noi ro boundary de ticket va context khong lech huong.",
    duration: "4-5 phut",
    outcome: "Biet cach ghi prompt de resume dung ticket hoac tao task moi.",
    focus: "context-safety",
    quickRefId: "qr-issue-choice",
    practiceMode: "mixed",
    lessonBlocks: [
      {
        title: "Resume dung cach",
        body: "Khi van de va outcome khong doi, tiep tuc trong cung section va noi 'cung issue nay'.",
        bullets: [
          "Supervisor se uu tien resume thread cu.",
          "Neu thread khong con, he thong rebuild tu context file.",
        ],
      },
      {
        title: "Tach issue moi",
        body: "Khi doi repo, doi outcome chinh hoac doi van de lon, phai noi ro 'day la issue moi'.",
        bullets: [
          "Neu o lai cung section, van phai ghi ro day la issue moi.",
          "Khong noi ro se de bot nghi van dang tiep tuc viec cu.",
        ],
      },
    ],
    evidenceBullets: ["Guide section 4.2, 4.6, 8, 11", "Simulator can hien ro consequence context file."],
  },
  {
    slug: "choose-right-bot",
    order: 4,
    title: "Choose The Right Bot",
    tagline: "Dung bot cho dung bai toan de prompt co diem den hop ly.",
    duration: "3-4 phut",
    outcome: "Map duoc task voi linux_main, lavis_linux va gaubot.",
    focus: "routing",
    quickRefId: "qr-bot-fit",
    practiceMode: "mixed",
    lessonBlocks: [
      {
        title: "Capability map",
        body: "Ba bot deu co cung co che persistent ticket + shared context, nhung phu hop nhat voi cac loai bai toan khac nhau.",
        bullets: [
          "linux_main: runtime, dieu phoi, deploy, integration.",
          "lavis_linux: analysis, review, root cause, specification.",
          "gaubot: implementation slice va code execution.",
        ],
      },
      {
        title: "Routing heuristics",
        body: "Task analysis sau hay architecture review nen ve lavis_linux. Task code fix ve gaubot. Task can dieu phoi runtime ve linux_main.",
        bullets: [
          "Sai bot van co the chay, nhung output de lech phong cach va pace.",
        ],
      },
    ],
    evidenceBullets: ["Guide section 9, 12", "Bot fit la mot truc score rieng trong Prompt Lab."],
  },
  {
    slug: "hidden-system",
    order: 5,
    title: "Hidden System",
    tagline: "Thay supervisor loop va context file song ra sao.",
    duration: "6-8 phut",
    outcome: "Tin vao hidden system vi da thay duoc state timeline.",
    focus: "simulation",
    quickRefId: "qr-hidden-system",
    practiceMode: "simulator",
    lessonBlocks: [
      {
        title: "System states",
        body: "Khi prompt duoc dispatch, he thong xac dinh section, tim task active, tao hoac resume ticket, cap nhat context va loop theo ket qua DONE/PARTIAL/BLOCKED.",
        bullets: [
          "Section giu boi canh.",
          "Ticket resume duoc thread.",
          "Context file cho phep khoi phuc task khi can.",
        ],
      },
      {
        title: "Visible consequence",
        body: "Prompt tot se dan den timeline gon gang. Prompt mo ho dan den NEEDS_INPUT, route sai, hoac context drift.",
        bullets: [
          "Simulator khong giong thuyet trinh; no cho user thay state doi theo lua chon.",
        ],
      },
    ],
    evidenceBullets: ["Guide section 2, 3, 6, 14", "Simulator la CP4 core mechanic."],
  },
  {
    slug: "blockers-and-auth",
    order: 6,
    title: "Blockers, Auth, Rate Limit",
    tagline: "Biet khi nao de bot tu lam va khi nao can can thiep.",
    duration: "5-6 phut",
    outcome: "Nho dung stop rules va auth flow da chot.",
    focus: "operations",
    quickRefId: "qr-stop-rules",
    practiceMode: "simulator",
    lessonBlocks: [
      {
        title: "Khi nao bot nen hoi",
        body: "Bot nen hoi lai khi thieu repo/muc tieu, can business decision, can credential hoac gap BLOCKED/NEEDS_INPUT.",
        bullets: [
          "Khong nen hoi lai cho cac buoc debug/reading file nho.",
        ],
      },
      {
        title: "Auth va rate limit",
        body: "Policy da chot la pair-device auth + Telegram alert + auto-probe/auto-resume, khong xoay API key am tham.",
        bullets: [
          "Rule ro giup owner biet luc nao can can thiep.",
          "Trust den tu behavior de hieu va co the du doan.",
        ],
      },
    ],
    evidenceBullets: ["Guide section 7, 10, 11, 13", "Scenario auth/rate limit la gate operations."],
  },
] as const;

const rawScenarios = [
  {
    id: "scenario-issue-boundary",
    missionSlug: "continue-or-new-issue",
    title: "Issue boundary drill",
    summary: "Ban dang o trong section deploy, nhung muon review auth flow cho repo khac.",
    steps: [
      {
        id: "start",
        prompt:
          "User dang o section cu va muon giao viec moi: 'review auth flow cho repo social-listening-v3'. Ban nen ghi yeu cau ra sao?",
        helper: "Chon cach giu context an toan nhat.",
        choices: [
          {
            id: "same-issue",
            label: "Cung issue nay, review auth flow cho repo social-listening-v3",
            feedback: "Sai boundary.",
            explanation:
              "Ban da tai su dung issue cu cho mot outcome moi. Context file se bi lech huong va supervisor co the resume nham thread.",
            isCorrect: false,
            timelineState: [
              {
                title: "Section reused",
                state: "Context drift risk",
                description: "Supervisor nghi day van la deploy issue cu.",
                tone: "danger",
              },
              {
                title: "Ticket resume",
                state: "Wrong thread",
                description: "Task cu duoc uu tien resume thay vi task auth moi.",
                tone: "danger",
              },
            ],
          },
          {
            id: "new-issue",
            label:
              "Day la issue moi, khong lien quan issue truoc. Repo: social-listening-v3. Muc tieu: review auth flow.",
            feedback: "Dung.",
            explanation:
              "Ban da noi ro boundary va repo moi. Supervisor se tao ticket moi hoac route lai boi canh cho dung.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Section context",
                state: "Reframed",
                description: "Prompt ghi ro day la issue moi nen hidden system doi boi canh an toan.",
                tone: "success",
              },
              {
                title: "Ticket",
                state: "New ticket created",
                description: "Supervisor tao ticket moi va khoi tao context file moi.",
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
    title: "Bot routing challenge",
    summary: "Ban can phan tich kien truc va chot 3 root cause truoc khi implement.",
    steps: [
      {
        id: "bot-step",
        prompt: "Task nay nen dua cho bot nao de output dung phong cach va pace nhat?",
        helper: "Chon bot phu hop nhat voi bai toan phan tich.",
        choices: [
          {
            id: "linux-main",
            label: "linux_main",
            feedback: "Chua toi uu.",
            explanation:
              "linux_main van chay duoc, nhung bai toan phan tich sau va spec ro rang hop hon voi lavis_linux.",
            isCorrect: false,
            timelineState: [
              {
                title: "Routing",
                state: "Operational fit",
                description: "Task duoc route sang bot co xu huong dieu phoi hon la thinking-first.",
                tone: "warn",
              },
            ],
          },
          {
            id: "lavis-linux",
            label: "lavis_linux",
            feedback: "Dung.",
            explanation:
              "Bai toan root cause, review, specification hop nhat voi lavis_linux theo guide section 9.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Routing",
                state: "Analysis-first",
                description: "Prompt den dung bot cho root cause va spec review.",
                tone: "success",
              },
            ],
          },
          {
            id: "gaubot",
            label: "gaubot",
            feedback: "Sai focus.",
            explanation:
              "gaubot hop hon cho implementation slice va code-level execution, khong phai review kien truc uu tien.",
            isCorrect: false,
            timelineState: [
              {
                title: "Routing",
                state: "Execution bias",
                description: "Task de bi day sang implementation truoc khi analysis duoc chot.",
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
    title: "Supervisor loop simulator",
    summary: "Prompt duoc gui voi repo, goal va rule ro rang. He thong se xu ly ra sao?",
    steps: [
      {
        id: "dispatch",
        prompt: "Chon ket qua he thong hop ly nhat khi prompt du thong tin va rule 'chi hoi toi neu blocked that'.",
        helper: "Think in terms of section -> ticket -> context -> loop.",
        choices: [
          {
            id: "instant-answer",
            label: "Bot tra loi ngay, khong tao ticket, khong context file",
            feedback: "Sai.",
            explanation:
              "Guide section 6 noi ro he thong tao/resume ticket, cap nhat context file va loop cho den khi xong hoac blocked that.",
            isCorrect: false,
            timelineState: [
              {
                title: "Dispatch",
                state: "Premature response",
                description: "Bot bao non va bo qua hidden system.",
                tone: "danger",
              },
            ],
          },
          {
            id: "loop",
            label: "Supervisor xac dinh section, tao/resume ticket, cap nhat context file va tiep tuc loop",
            feedback: "Dung.",
            explanation:
              "Day la hidden system flow da chot. Neu ket qua PARTIAL, supervisor co the tiep tuc vong tiep theo.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Section",
                state: "Bound",
                description: "Cuoc viec duoc gan vao boi canh section hien tai.",
                tone: "success",
              },
              {
                title: "Ticket",
                state: "Created or resumed",
                description: "Supervisor tim task active hoac tao ticket moi.",
                tone: "success",
              },
              {
                title: "Context file",
                state: "Updated",
                description: "Goal, facts, decisions va next step duoc viet vao context.",
                tone: "success",
              },
              {
                title: "Loop",
                state: "Continue until done",
                description: "DONE -> tom tat. PARTIAL -> tiep tuc. BLOCKED -> hoi owner.",
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
    title: "Auth and blocker decision",
    summary: "Codex cham rate limit trong luc supervisor dang loop.",
    steps: [
      {
        id: "auth-step",
        prompt: "He thong nen xu ly the nao de behavior de hieu va co the du doan?",
        helper: "Chon policy da chot trong guide.",
        choices: [
          {
            id: "rotate-key",
            label: "Am tham xoay API key khac de tiep tuc",
            feedback: "Sai policy.",
            explanation:
              "Guide da chot khong tu xoay API key trong loop. Cach do lam owner mat niem tin vao account dang duoc dung.",
            isCorrect: false,
            timelineState: [
              {
                title: "Auth flow",
                state: "Opaque",
                description: "Credential doi ngam, behavior tro nen kho doan.",
                tone: "danger",
              },
            ],
          },
          {
            id: "pair-device",
            label: "Chuyen sang pair-device auth, gui alert, cho auto-probe va auto-resume",
            feedback: "Dung.",
            explanation:
              "Day la flow da chot: pair-device auth + Telegram alert + auto-probe/auto-resume.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Incident",
                state: "Rate limited",
                description: "Supervisor danh dau incident auth/quota.",
                tone: "warn",
              },
              {
                title: "Owner action",
                state: "Pair-device auth",
                description: "Owner auth lai bang thiet bi phu hop khi duoc alert.",
                tone: "success",
              },
              {
                title: "Recovery",
                state: "Auto probe -> auto resume",
                description: "He thong thu lai va tiep tuc task sau khi healthy.",
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
