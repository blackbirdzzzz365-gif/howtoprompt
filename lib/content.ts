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
    slug: "quick-raid",
    title: "Quick Raid",
    summary: "Dung khi ban can chay production audit ngay va dung dung gate.",
    recommendedFor: "owner dang can evidence that tu production truoc khi quyet dinh.",
    primaryMissionSlugs: ["read-the-board", "one-gate-one-prompt", "production-raid"],
  },
  {
    slug: "full-campaign",
    title: "Full Campaign",
    summary: "Di qua full vong lap san pham: audit, chot huong, execute, merge/replay, revalidate.",
    recommendedFor: "nguoi muon onboard lai chuan workflow OpenClaw x Codex cho social-listening-v3.",
    primaryMissionSlugs: [
      "read-the-board",
      "one-gate-one-prompt",
      "production-raid",
      "direction-lock",
      "phase-executor",
      "merge-or-replay",
    ],
  },
  {
    slug: "release-gate",
    title: "Release Gate",
    summary: "Tap trung vao candidate summary, merge/deploy gate va revalidation sau production.",
    recommendedFor: "luc ban dang can quyet dinh merge len main repo hay replay them mot vong.",
    primaryMissionSlugs: ["direction-lock", "phase-executor", "merge-or-replay"],
  },
] as const;

const rawQuickRefs = [
  {
    id: "qr-runtime-map",
    title: "Runtime map that",
    summary: "Biet dung san choi de khong gui sai lenh vao sai lop he thong.",
    bullets: [
      "Runtime OpenClaw x Codex that dang chay tren linuxvm (openclawlinus).",
      "3 bot Linux-side: linux_main, lavis_linux, gaubot.",
      "chiasegpu-vm khong phai runtime OpenClaw x Codex chinh.",
      "Topology co ban: owner -> Telegram section -> bot -> codex-telegram-dispatch -> codex-ticket -> codex-supervisor -> Codex CLI -> repo.",
    ],
    unlocksFromMission: "read-the-board",
  },
  {
    id: "qr-one-gate",
    title: "One gate, one prompt",
    summary: "Mot prompt tot chi nen di qua mot gate lon cua product loop.",
    bullets: [
      "Khong tron audit + implementation + merge trong mot prompt.",
      "Neu dang tiep tuc issue cu, noi ro 'cung issue nay'.",
      "Neu tach viec moi, noi ro 'day la issue moi'.",
      "Rule tot: chi hoi toi neu blocked that hoac can business decision.",
    ],
    unlocksFromMission: "one-gate-one-prompt",
  },
  {
    id: "qr-production-audit",
    title: "Production audit spell",
    summary: "Cong thuc de chay live truth va dung lai o checkpoint verdict.",
    bullets: [
      "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.",
      "Repo: social-listening-v3",
      "Muc tieu: chay live case pack, doi chieu phase active, tao checkpoint verdict.",
      "Rule: dung o checkpoint verdict, chua implement, chua deploy.",
    ],
    unlocksFromMission: "production-raid",
  },
  {
    id: "qr-direction-lock",
    title: "Direction lock",
    summary: "Sau checkpoint verdict, owner phai chot huong bang mot lenh ngan va ro.",
    bullets: [
      "Chot huong: contained-fix.",
      "Chot huong: new-phase.",
      "Neu chua duoc chot huong, agent khong nen nhay sang branch/docs/code.",
      "Gate 1 la luc duy nhat owner quyet dung contained-fix hay new-phase.",
    ],
    unlocksFromMission: "direction-lock",
  },
  {
    id: "qr-phase-executor",
    title: "Phase executor spell",
    summary: "Sau khi owner chot huong, Codex moi duoc vao branch/docs/checkpoint/code.",
    bullets: [
      "@gaubot hay tro chuyen voi codex va dung skill social-listening-v3-phase-executor.",
      "Repo: social-listening-v3",
      "Muc tieu: lay latest main, tao branch codex/<phase>, dong goi docs, break checkpoint, implement, validate, tao candidate summary.",
      "Rule: dung o candidate summary, khong merge, khong deploy.",
    ],
    unlocksFromMission: "phase-executor",
  },
  {
    id: "qr-merge-replay",
    title: "Merge or replay",
    summary: "Gate 2 quyet dinh co merge/deploy hay quay lai brainstorm va iterate them.",
    bullets: [
      "Neu candidate summary dat yeu cau, owner moi trigger merge/deploy.",
      "Neu chua chac, owner co the yeu cau brainstorm them roi quay lai Phase Executor.",
      "Sau deploy, quay lai Production Audit de revalidate tren production that.",
      "Auth/rate limit tren linuxvm di theo pair-device auth + alert + auto-probe + auto-resume.",
    ],
    unlocksFromMission: "merge-or-replay",
  },
] as const;

const rawMissions = [
  {
    slug: "read-the-board",
    order: 1,
    title: "Read The Board",
    tagline: "Thay dung san choi truoc khi ban ra lenh.",
    duration: "6-8 phut",
    outcome: "Biet khi nao nen dung OpenClaw, khi nao nen vao Codex truc tiep, va runtime that dang o dau.",
    focus: "runtime-topology",
    quickRefId: "qr-runtime-map",
    practiceMode: "simulator",
    useWhen: "Khi ban muon onboard lai ban than hoac giai thich cho nguoi moi he thong dang chay nhu the nao.",
    winCondition: "Ban co the tu ve lai topology owner -> bot -> Codex -> repo -> production trong 30 giay.",
    failureModes: [
      "Nghi rang chiasegpu-vm la runtime chinh cua OpenClaw x Codex.",
      "Khong biet luc nao nen nhac bot trong Telegram, luc nao nen mo Codex trong IDE.",
      "Khong biet ba bot linux_main, lavis_linux, gaubot khac nhau o dau.",
    ],
    lessonBlocks: [
      {
        title: "Feynman picture",
        body: "Hay tuong tuong ban dang choi mot game chien thuat. Ban khong noi chuyen truc tiep voi moi worker o hau truong. Ban ra lenh tai ban dieu khien, bot mang lenh vao hidden system, Codex xu ly sau canh ga, roi dua evidence tro lai.",
        bullets: [
          "Telegram section giu boi canh cua mot cuoc viec.",
          "Bot la nguoi dieu phoi va canh cua vao hidden runtime.",
          "Codex la worker giai quyet bai toan ky thuat o workspace that.",
        ],
      },
      {
        title: "True runtime da verify",
        body: "Tinh den ngay 2026-03-31, runtime OpenClaw x Codex that da verify dang chay tren linuxvm (openclawlinus), khong phai chiasegpu-vm.",
        bullets: [
          "Entry command on linuxvm: codex, repo-path, codex-ticket, codex-dispatch, codex-telegram-dispatch.",
          "Shared context/ticket state nam trong ~/.openclaw va <workspace>/.openclaw/tickets/<ticket>/CONTEXT-<ticket>.md.",
          "Absolute path /Users/nguyenquocthong/... da duoc compatibility-map de Codex skills van resolve dung tren Linux.",
        ],
      },
    ],
    examplePrompts: [
      {
        label: "Dung OpenClaw khi ban muon delegation co nho bo va co the resume sau",
        prompt:
          "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.\nRepo: social-listening-v3\nMuc tieu: chay live case pack va tao checkpoint verdict.\nRule: dung o checkpoint verdict.",
      },
      {
        label: "Dung Codex truc tiep khi ban dang o IDE va muon loop sat sao",
        prompt:
          "Dung social-listening-v3-production-audit cho social-listening-v3. Chay case tpbank-evo-general-feedback o che do artifact-only truoc, sau do giai thich cach route tiep theo.",
      },
    ],
    evidenceBullets: [
      "Runtime da verify tren linuxvm voi codex-telegram-dispatch --wait cho linux_main, lavis_linux, gaubot.",
      "Guide phai noi ro chiasegpu-vm khong phai runtime chinh cua OpenClaw x Codex.",
    ],
  },
  {
    slug: "one-gate-one-prompt",
    order: 2,
    title: "One Gate, One Prompt",
    tagline: "Dung prompt de qua mot cua, khong phai de choi het ca map trong mot lan.",
    duration: "5-7 phut",
    outcome: "Viet duoc prompt chi ro mot gate: audit, direction lock, execute, merge, hay revalidate.",
    focus: "prompt-discipline",
    quickRefId: "qr-one-gate",
    practiceMode: "mixed",
    useWhen: "Khi ban thay prompt cua minh dang tham va muon audit + implement + deploy cung luc.",
    winCondition: "Prompt cua ban noi ro repo, goal, stop rule, va chi di qua mot gate lon.",
    failureModes: [
      "Tron audit production voi branch/docs/code trong mot prompt.",
      "Khong noi ro issue moi hay issue cu.",
      "Thieu stop rule nen bot bao non hoac hoi nguoc qua som.",
    ],
    lessonBlocks: [
      {
        title: "Cong thuc prompt can ban",
        body: "Prompt tot cho OpenClaw x Codex van giu bo khung 4 dong, nhung dong 3 phai noi ro gate dang choi.",
        bullets: [
          "Dong 1: bot + hay tro chuyen voi codex",
          "Dong 2: Repo",
          "Dong 3: Muc tieu cua gate hien tai",
          "Dong 4: Rule dung o dau",
        ],
      },
      {
        title: "Ly do mot prompt chi nen co mot gate",
        body: "Neu prompt vua bat audit, vua bat tao branch, vua bat deploy, hidden system se mat mot diem dung ro rang. Ket qua thuong la bao non, context drift, hoac xin them chi dao giua duong.",
        bullets: [
          "Audit phai dung o checkpoint verdict.",
          "Phase executor phai dung o candidate summary.",
          "Merge/deploy la gate rieng cua owner.",
        ],
      },
    ],
    examplePrompts: [
      {
        label: "Prompt audit tot",
        prompt:
          "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.\nRepo: social-listening-v3\nMuc tieu: chay live 2 case production va tao checkpoint verdict cho phase hien tai.\nRule: dung o checkpoint verdict, khong implement.",
      },
      {
        label: "Prompt xau can tranh",
        prompt:
          "@linux_mainbot hay tro chuyen voi codex va audit phase 9, neu thay loi thi pull repo moi nhat, tao branch, viet docs, code fix, merge len main va deploy luon.",
      },
    ],
    evidenceBullets: [
      "Prompt Lab van cham theo 4 truc: clarity, context safety, operational control, bot fit.",
      "Rule trung tam moi la one gate, one prompt.",
    ],
  },
  {
    slug: "production-raid",
    order: 3,
    title: "Production Raid",
    tagline: "Chay live truth truoc khi mo phase moi hay code fix.",
    duration: "7-9 phut",
    outcome: "Biet yeu cau audit dung cach de Codex lay evidence that va dung lai o checkpoint verdict.",
    focus: "production-truth",
    quickRefId: "qr-production-audit",
    practiceMode: "mixed",
    useWhen: "Khi ban can biet phase hien tai co that su giai quyet duoc van de tren production hay chua.",
    winCondition: "Ban nhan duoc checkpoint verdict co case pack, evidence, phase expectation vs actual, va recommendation.",
    failureModes: [
      "Dua ra huong fix khi chua co run packet that.",
      "Danh dong run khong fail = thanh cong du user problem van chua duoc giai quyet.",
      "Khong noi ro live hay artifact-only.",
    ],
    lessonBlocks: [
      {
        title: "Audit dung nghia la gi",
        body: "Production audit khong phai doc log cho vui. No la mot raid vao production that de chay case pack, lay run packet, doi chieu voi muc tieu phase va tra checkpoint verdict de owner chot huong.",
        bullets: [
          "Co the chay live hoac artifact-only, nhung ban phai noi ro.",
          "Output can co checkpoint verdict, khong nhay vao branch/docs/code.",
          "linux_main la bot hop ly nhat cho runtime, deploy, proof va integration.",
        ],
      },
      {
        title: "Case pack va verdict",
        body: "Case pack la bo bai test song. Verdict la ban ket luan o cuoi raid. Neu verdict mo ho, raid xem nhu chua xong.",
        bullets: [
          "Case pack nen ghi ro case nao la canary, case nao la edge case.",
          "Verdict phai tra loi duoc: dat ky vong phase chua, user problem giai quyet chua, route tiep theo la gi.",
        ],
      },
    ],
    examplePrompts: [
      {
        label: "OpenClaw audit prompt",
        prompt:
          "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.\nRepo: social-listening-v3\nMuc tieu: chay live case ngu-hoa-market-sentiment va tpbank-evo-general-feedback, doi chieu voi phase active, tao checkpoint verdict.\nRule: dung o checkpoint verdict, chua implement, chua deploy.",
      },
      {
        label: "Codex direct prompt",
        prompt:
          "Dung social-listening-v3-production-audit cho social-listening-v3. Chay artifact-only truoc neu can, sau do de xuat case nao nen chay live de khoa checkpoint verdict.",
      },
    ],
    evidenceBullets: [
      "social-listening-v3-production-audit la repo adapter cho step 1 cua product loop.",
      "Checkpoint verdict la human gate 1, khong phai implementation gate.",
    ],
  },
  {
    slug: "direction-lock",
    order: 4,
    title: "Direction Lock",
    tagline: "Checkpoint verdict chi co gia tri neu owner chot huong ro.",
    duration: "4-6 phut",
    outcome: "Biet cach doc verdict va chot mot trong hai huong: contained-fix hoac new-phase.",
    focus: "decision-gate",
    quickRefId: "qr-direction-lock",
    practiceMode: "simulator",
    useWhen: "Ngay sau khi audit tra checkpoint verdict va ban can cho phep agent di tiep.",
    winCondition: "Ban co the noi mot cau ngan de khoa huong va agent khong con phai doan y ban.",
    failureModes: [
      "Noi chung chung 'fix giup toi' sau checkpoint verdict.",
      "Bat agent vao code khi chua chot contained-fix hay new-phase.",
      "Dua ra quyet dinh business mo ho khong co stop condition.",
    ],
    lessonBlocks: [
      {
        title: "Contained-fix vs new-phase",
        body: "Contained-fix dung khi van de nam trong boundary da khoa cua phase hien tai. New-phase dung khi can mo them scope, metrics, architecture, stories hay checkpoint package moi.",
        bullets: [
          "Contained-fix thuong la regression, missing retry, route ordering, browser lease, config sai trong boundary da khoa.",
          "New-phase thuong la khi user problem chua duoc giai quyet du code da chay dung theo expectation cu.",
          "Neu chua du evidence, route dung la quay lai audit, khong phai doan.",
        ],
      },
      {
        title: "Gate 1 phai ngan va rat ro",
        body: "Ban khong can viet mot bai van dai. Ban can mot lenh chot huong ngan, ro va khong nuoc doi.",
        bullets: [
          "Chot huong: contained-fix.",
          "Chot huong: new-phase.",
          "Neu co them boundary, noi kem mot cau ve scope va stop rule.",
        ],
      },
    ],
    examplePrompts: [
      {
        label: "Chot huong contained-fix",
        prompt:
          "Chot huong: contained-fix. Chi sua browser lease va closeout retry trong scope phase hien tai. Dung social-listening-v3-phase-executor va dung o candidate summary.",
      },
      {
        label: "Chot huong new-phase",
        prompt:
          "Chot huong: new-phase. Phase tiep theo phai giai quyet answer quality sau closeout va source memory giua cac run. Dung social-listening-v3-phase-executor va dung o candidate summary.",
      },
    ],
    evidenceBullets: [
      "Gate 1 duoc chot bang owner command, khong phai agent tu suy doan.",
      "blackbird-production-phase-loop v2 da route 3 nhanh: evidence-weak, contained-fix, new-phase.",
    ],
  },
  {
    slug: "phase-executor",
    order: 5,
    title: "Phase Executor",
    tagline: "Sau khi huong da khoa, moi vao branch, docs, checkpoint va code.",
    duration: "8-10 phut",
    outcome: "Biet cach goi skill executor de Codex tu lay latest main, tao branch, viet docs, break checkpoint, implement va tao candidate summary.",
    focus: "execution-loop",
    quickRefId: "qr-phase-executor",
    practiceMode: "prompt-lab",
    useWhen: "Sau Gate 1, khi ban da muon agent chay sang implementation machine.",
    winCondition: "Nhan duoc candidate summary voi branch ro rang, docs/checkpoint da dong goi, validation da chay, va chua merge.",
    failureModes: [
      "Khong noi ro dung o candidate summary.",
      "Khong bat dau tu latest main / branch moi.",
      "Bo qua package docs va checkpoint, nhay thang vao code.",
    ],
    lessonBlocks: [
      {
        title: "Executor thuc su lam gi",
        body: "social-listening-v3-phase-executor la repo adapter cho buoc 2. Sau khi owner chot huong, no phai keo code moi nhat, tao branch moi, dong goi docs phase, break checkpoint, implement lan luot, validate, va dung o candidate summary.",
        bullets: [
          "Voi implementation-heavy task, gaubot la diem den hop ly nhat.",
          "Voi phan tich kien truc, co the de lavis_linux brainstorm truoc roi moi giao cho executor.",
          "Merge va deploy khong nam trong mission nay.",
        ],
      },
      {
        title: "Artifact can thay duoc",
        body: "Ban khong nen chap nhan executor ma khong thay duoc branch, docs, checkpoint package, ket qua validation, va candidate summary.",
        bullets: [
          "Branch prefix mac dinh la codex/...",
          "Docs phase phai noi ro scope, architecture delta, checkpoint breakdown va validation.",
          "Candidate summary la human gate 2, khong phai deploy ticket.",
        ],
      },
    ],
    examplePrompts: [
      {
        label: "Executor qua OpenClaw",
        prompt:
          "@gaubot hay tro chuyen voi codex va dung skill social-listening-v3-phase-executor.\nRepo: social-listening-v3\nMuc tieu: lay latest main, tao branch codex/phase-10-answer-quality, dong goi docs, break checkpoint, implement, validate, tao candidate summary.\nRule: dung o candidate summary, khong merge, khong deploy.",
      },
      {
        label: "Executor truc tiep trong Codex",
        prompt:
          "Chot huong: contained-fix. Dung social-listening-v3-phase-executor. Lay latest main, tao branch moi, docs package toi thieu, checkpoint, implementation, validation, va dung o candidate summary.",
      },
    ],
    evidenceBullets: [
      "social-listening-v3-phase-executor la repo adapter cho step 2 cua product loop.",
      "Skill nay da duoc sync len linuxvm de bot OpenClaw goi Codex dung no.",
    ],
  },
  {
    slug: "merge-or-replay",
    order: 6,
    title: "Merge Or Replay",
    tagline: "Owner quyet merge/deploy hay quay lai brainstorming va mot vong execute moi.",
    duration: "6-8 phut",
    outcome: "Biet cach doc candidate summary, trigger merge/deploy gate, hoac replay them mot vong roi revalidate production.",
    focus: "release-gate",
    quickRefId: "qr-merge-replay",
    practiceMode: "simulator",
    useWhen: "Sau khi Phase Executor dung lai va dua candidate summary len cho ban.",
    winCondition: "Ban phan biet ro Gate 2 voi implementation gate, va luon quay lai audit sau deploy.",
    failureModes: [
      "Merge/deploy ngay khi chua review candidate summary.",
      "Continue brainstorm ma khong noi ro replay them vong nao.",
      "Quen revalidate production sau deploy.",
    ],
    lessonBlocks: [
      {
        title: "Gate 2 la gi",
        body: "Gate 2 la luc owner nhin candidate summary va quyet: merge/deploy, hay brainstorm them va replay vong phat trien. Day la quyet dinh cua owner, khong phai cua executor.",
        bullets: [
          "Merge/deploy chi nen xay ra sau khi owner da review candidate summary.",
          "Neu chua chac, yeu cau brainstorm them roi chay lai executor la chuyen binh thuong.",
          "Sau deploy, loop chua dong cho den khi da revalidate tren production that.",
        ],
      },
      {
        title: "Runtime incidents van la mot phan cua game",
        body: "Ngay ca luc auth, quota, hay rate limit xay ra, behavior van phai de hieu: alert, pair-device auth, auto-probe, auto-resume. Khong xoay key am tham.",
        bullets: [
          "OpenClaw bot nen hoi lai khi can business decision, credential, hoac blocker that.",
          "Rate limit tren linuxvm phai di dung flow pair-device auth da chot.",
          "Trust den tu behavior co the du doan, khong den tu ma thuat credential.",
        ],
      },
    ],
    examplePrompts: [
      {
        label: "Mo merge/deploy gate",
        prompt:
          "@linux_mainbot hay tro chuyen voi codex va chuan bi merge/deploy gate cho candidate nay.\nRepo: social-listening-v3\nMuc tieu: tom tat candidate summary, neu khong con blocker thi dung truoc buoc merge production.\nRule: khong merge neu toi chua chot.",
      },
      {
        label: "Replay them mot vong",
        prompt:
          "Dung truoc gate merge. Toi muon brainstorm them ve source memory giua cac run, sau do quay lai social-listening-v3-phase-executor cho phase nay.",
      },
    ],
    evidenceBullets: [
      "Gate 2 la merge/deploy hay replay, sau do quay lai Production Audit de revalidate.",
      "Auth policy da chot: pair-device auth + Telegram alert + auto-probe + auto-resume.",
    ],
  },
] as const;

const rawScenarios = [
  {
    id: "scenario-runtime-choice",
    missionSlug: "read-the-board",
    title: "Control surface choice",
    summary: "Ban dang o Telegram va muon bot theo doi audit production co nho bo, co the resume sau va dung dung runtime Linux VM.",
    steps: [
      {
        id: "start",
        prompt: "Ban nen goi control surface nao la hop ly nhat cho bai toan nay?",
        helper: "Nghi theo yeu cau delegation, shared context, va runtime tren linuxvm.",
        choices: [
          {
            id: "direct-codex",
            label: "Mo Codex local va tu chat trong IDE",
            feedback: "Chua toi uu.",
            explanation:
              "Codex local hop khi ban muon loop sat sao trong IDE. O day bai toan can bot-side delegation, persistent ticket va kha nang resume qua Telegram.",
            isCorrect: false,
            timelineState: [
              {
                title: "Control surface",
                state: "Too close-range",
                description: "Ban mat bot memory va dispatch wrapper ma OpenClaw dang cung cap.",
                tone: "warn",
              },
            ],
          },
          {
            id: "openclaw-bot",
            label: "Nhac linux_mainbot trong section va noi ro production audit gate",
            feedback: "Dung.",
            explanation:
              "Ban dang dung dung mat ngoai cua hidden system: bot -> codex-telegram-dispatch -> codex-ticket -> codex-supervisor -> Codex CLI tren linuxvm.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Dispatch",
                state: "Bot-side delegation",
                description: "OpenClaw giu section context va tao hoac resume ticket cho issue nay.",
                tone: "success",
              },
              {
                title: "Runtime",
                state: "linuxvm active",
                description: "codex-telegram-dispatch va codex-supervisor tren linuxvm xu ly task.",
                tone: "success",
              },
            ],
          },
          {
            id: "chiasegpu",
            label: "SSH vao chiasegpu-vm va co gang tim OpenClaw runtime o do",
            feedback: "Sai runtime.",
            explanation:
              "chiasegpu-vm khong phai runtime OpenClaw x Codex chinh da verify. Runtime that nam o linuxvm.",
            isCorrect: false,
            timelineState: [
              {
                title: "Runtime assumption",
                state: "Wrong machine",
                description: "Ban di sai map ngay tu dau nen se khong thay ticket/runtime dung.",
                tone: "danger",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-gate-discipline",
    missionSlug: "one-gate-one-prompt",
    title: "Gate discipline drill",
    summary: "Ban muon audit phase 9, neu thay loi thi pull main, tao branch, code fix, merge va deploy trong cung mot prompt.",
    steps: [
      {
        id: "gate-step",
        prompt: "Cach viet nao dung nhat voi product loop da chot?",
        helper: "Chon cach giu gate ro rang va co diem dung an toan.",
        choices: [
          {
            id: "all-in-one",
            label: "Giup toi audit, code, merge, deploy luon trong mot prompt cho nhanh",
            feedback: "Sai loop.",
            explanation:
              "Prompt nay tron nhieu gate lon vao mot lan. Hidden system se mat diem dung ro rang va owner cung mat human gate 1 va gate 2.",
            isCorrect: false,
            timelineState: [
              {
                title: "Gate state",
                state: "Collapsed",
                description: "Audit, execution va release gate bi don thanh mot cuc mo ho.",
                tone: "danger",
              },
            ],
          },
          {
            id: "split-gates",
            label: "Chay production audit truoc, dung o checkpoint verdict, roi toi moi chot huong gate tiep theo",
            feedback: "Dung.",
            explanation:
              "Day la cach choi dung. Audit tra verdict. Owner khoa huong. Executor code. Owner moi mo merge/deploy gate.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Audit gate",
                state: "Checkpoint verdict",
                description: "Live truth duoc lay truoc khi mo bat ky gate nao tiep theo.",
                tone: "success",
              },
              {
                title: "Owner gate",
                state: "Direction locked",
                description: "Contained-fix hoac new-phase duoc chot ro rang.",
                tone: "success",
              },
              {
                title: "Release gate",
                state: "Preserved",
                description: "Merge/deploy van la quyet dinh rieng cua owner sau candidate summary.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-production-verdict",
    missionSlug: "production-raid",
    title: "Checkpoint verdict drill",
    summary: "Case pack da chay live. Report cho thay run khong fail, nhung user problem van chua duoc giai quyet hoan toan.",
    steps: [
      {
        id: "verdict-step",
        prompt: "Checkpoint verdict dung nhat nen la gi?",
        helper: "Dung chi so user outcome, khong chi trang thai process.",
        choices: [
          {
            id: "green",
            label: "Run khong fail nen phase da thanh cong, co the merge tiep",
            feedback: "Sai.",
            explanation:
              "Khong fail khong dong nghia user problem da duoc giai quyet. Production audit phai danh gia expectation vs actual va value that cho user.",
            isCorrect: false,
            timelineState: [
              {
                title: "Verdict",
                state: "False green",
                description: "Ban danh dong process health = product success.",
                tone: "danger",
              },
            ],
          },
          {
            id: "recommend",
            label: "Bao cao rang phase moi dat mot phan expectation, user problem chua giai quyet het, can checkpoint verdict va owner chot huong",
            feedback: "Dung.",
            explanation:
              "Checkpoint verdict dung phai tach expectation ky thuat va outcome that. Neu chua giai quyet duoc bai toan user, owner van phai chot huong tiep theo.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Run packet",
                state: "Evidence collected",
                description: "Case pack, logs, report va observed delta duoc dong goi.",
                tone: "success",
              },
              {
                title: "Verdict",
                state: "Partial expectation",
                description: "Phase dat mot phan expectation ky thuat nhung chua khoa duoc product problem.",
                tone: "success",
              },
              {
                title: "Gate 1",
                state: "Owner decision needed",
                description: "Contained-fix hay new-phase chi duoc mo sau khi owner chot huong.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-contained-fix",
    missionSlug: "direction-lock",
    title: "Contained-fix or new-phase",
    summary: "Verdict cho thay closeout retry va browser lease dang gay regression, nhung issue van nam tron trong scope phase hien tai.",
    steps: [
      {
        id: "direction-step",
        prompt: "Owner nen chot huong nao?",
        helper: "Xem issue co nam trong boundary phase da khoa hay khong.",
        choices: [
          {
            id: "new-phase",
            label: "Chot huong: new-phase",
            feedback: "Chua can thiet.",
            explanation:
              "Neu van de van nam tron trong boundary phase da khoa va khong doi architecture contract lon, contained-fix la route gon hon va dung hon.",
            isCorrect: false,
            timelineState: [
              {
                title: "Scope",
                state: "Over-expanded",
                description: "Ban mo phase moi khi chua can mo them boundary.",
                tone: "warn",
              },
            ],
          },
          {
            id: "contained-fix",
            label: "Chot huong: contained-fix",
            feedback: "Dung.",
            explanation:
              "Regression nam trong scope da khoa, nen route gon dung la contained-fix roi giao cho executor dung o candidate summary.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Decision",
                state: "Contained-fix",
                description: "Owner khoa mot route nho, nhanh, co boundary ro.",
                tone: "success",
              },
              {
                title: "Executor",
                state: "Can move now",
                description: "Agent duoc phep vao latest main -> branch -> docs -> checkpoint -> code -> candidate summary.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-merge-gate",
    missionSlug: "merge-or-replay",
    title: "Merge gate decision",
    summary: "Candidate summary da san sang, nhung owner van thay can brainstorm them mot huong memory moi truoc khi len main.",
    steps: [
      {
        id: "merge-step",
        prompt: "Ban nen lam gi de giu dung human gate 2?",
        helper: "Gate 2 la quyet dinh cua owner, khong phai cua executor.",
        choices: [
          {
            id: "merge-now",
            label: "Merge va deploy luon vi candidate summary da co",
            feedback: "Sai gate.",
            explanation:
              "Candidate summary la input cho owner review, khong phai lenh merge tu dong. Neu owner chua chac, can replay mot vong nho hon.",
            isCorrect: false,
            timelineState: [
              {
                title: "Gate 2",
                state: "Skipped",
                description: "Owner mat quyen kiem soat release va production risk tang len.",
                tone: "danger",
              },
            ],
          },
          {
            id: "replay",
            label: "Dung truoc gate merge, brainstorm them, roi quay lai executor neu can",
            feedback: "Dung.",
            explanation:
              "Day la cach giu dung Gate 2. Owner co the replay mot vong, sau do moi mo merge/deploy gate khi da chac.",
            isCorrect: true,
            marksMissionComplete: true,
            timelineState: [
              {
                title: "Gate 2",
                state: "Owner retained control",
                description: "Candidate summary duoc review thay vi bi coi la merge ticket.",
                tone: "success",
              },
              {
                title: "Loop",
                state: "Replay allowed",
                description: "Ban co the brainstorm them roi quay lai executor truoc khi deploy.",
                tone: "success",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scenario-auth-recovery",
    missionSlug: "merge-or-replay",
    title: "Auth recovery on linuxvm",
    summary: "Trong luc bot dang cho Codex revalidate, Codex gap rate limit/auth issue tren linuxvm.",
    steps: [
      {
        id: "auth-step",
        prompt: "He thong nen xu ly the nao de de hieu va co the du doan?",
        helper: "Chon policy auth da chot.",
        choices: [
          {
            id: "rotate-key",
            label: "Am tham xoay API key khac de tiep tuc",
            feedback: "Sai policy.",
            explanation:
              "Policy da chot la khong xoay key am tham. Cach do lam owner mat niem tin vao account va flow dang duoc su dung.",
            isCorrect: false,
            timelineState: [
              {
                title: "Auth policy",
                state: "Opaque",
                description: "Credential bi doi ngam va operator khong con nhin thay he thong dang song the nao.",
                tone: "danger",
              },
            ],
          },
          {
            id: "pair-device",
            label: "Pair-device auth, gui alert, cho auto-probe va auto-resume",
            feedback: "Dung.",
            explanation:
              "Day la flow da chot va da verify: pair-device auth + Telegram alert + auto-probe + auto-resume.",
            isCorrect: true,
            timelineState: [
              {
                title: "Incident",
                state: "Rate limit or auth required",
                description: "Supervisor danh dau ticket can recovery tren linuxvm.",
                tone: "warn",
              },
              {
                title: "Owner action",
                state: "Pair-device auth",
                description: "Owner auth lai dung account thay vi doi credential am tham.",
                tone: "success",
              },
              {
                title: "Recovery",
                state: "Auto probe -> auto resume",
                description: "Sau khi healthy, hidden system tiep tuc vong dang do.",
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
