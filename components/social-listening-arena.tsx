"use client";

import { useState } from "react";
import { useAcademyProgress } from "@/components/app-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PageSection } from "@/components/ui/layout";
import { Surface } from "@/components/ui/surface";

type RoleId = "owner" | "linux_main" | "lavis_linux" | "gaubot" | "codex" | "github";

type ArenaRole = {
  id: RoleId;
  name: string;
  classLabel: string;
  summary: string;
  bestFor: string;
  skills: string[];
};

type ArenaTurn = {
  id: string;
  title: string;
  ownerLine: string;
  botMove: string;
  codexMove: string;
  skills: string[];
  artifacts: string[];
  stopRule: string;
  takeaway: string;
  activeRoles: RoleId[];
};

type ArenaQuest = {
  id: string;
  title: string;
  difficulty: string;
  objective: string;
  whenToPlay: string;
  winCondition: string;
  party: RoleId[];
  badMove: string;
  turns: ArenaTurn[];
};

const roles: ArenaRole[] = [
  {
    id: "owner",
    name: "Owner",
    classLabel: "Gate keeper",
    summary: "Chot gate, doi huong business, va quyet merge/deploy hay replay them.",
    bestFor: "Noi cau ngan, ro, co diem dung. Ban khong viet bai van dai cho gate.",
    skills: ["human-gate-1", "human-gate-2"],
  },
  {
    id: "linux_main",
    name: "linux_main",
    classLabel: "Runtime lead",
    summary: "Dan bot-side delegation, production audit, deploy gate, revalidation, integration proof.",
    bestFor: "Production truth, runtime, deploy/revalidate, summary o muc he thong.",
    skills: ["social-listening-v3-product-loop", "social-listening-v3-production-audit", "ssh-openclaw-vm"],
  },
  {
    id: "lavis_linux",
    name: "lavis_linux",
    classLabel: "Strategist",
    summary: "Dao root cause, challenge scope, challenge metrics, va stress-test huong di.",
    bestFor: "Khi checkpoint verdict con mo hoac ban can rat ro contained-fix vs new-phase.",
    skills: ["blackbird-critical-review", "product-analyst", "social-listening-v3-product-loop"],
  },
  {
    id: "gaubot",
    name: "gaubot",
    classLabel: "Builder",
    summary: "Keo latest main, tao branch, package docs, checkpoint, code, validation, candidate summary.",
    bestFor: "Execution machine sau khi owner da khoa huong.",
    skills: ["social-listening-v3-phase-executor", "blackbird-delivery-control", "implement-system-design"],
  },
  {
    id: "codex",
    name: "Codex",
    classLabel: "Worker engine",
    summary: "Doc skills, doc repo, chay lenh, sua file, tao artifact, va bao cao lai cho bot.",
    bestFor: "Moi thao tac ky thuat that: docs, code, commands, analysis, validation.",
    skills: ["selected-by-bot-prompt", "repo-commands", "artifact-writing"],
  },
  {
    id: "github",
    name: "GitHub + Prod",
    classLabel: "Release world",
    summary: "Nhan code da merge vao main, build image, deploy server, va mo vong revalidation.",
    bestFor: "Gate merge/deploy va production state that.",
    skills: ["build-image.yml", "deploy-production.yml", "rollback-production.yml"],
  },
];

const quests: ArenaQuest[] = [
  {
    id: "production-raid",
    title: "Quest 1: Production Raid",
    difficulty: "Gate 1",
    objective: "Lay production truth truoc khi noi ve fix.",
    whenToPlay: "Khi phase dang chay nhung ban chua chac user problem da duoc giai quyet that tren production.",
    winCondition: "Nhan duoc checkpoint verdict co run packet, expectation vs actual, va prompt ngan de chot huong.",
    party: ["owner", "linux_main", "codex"],
    badMove: "Sai lam pho bien nhat la audit xong bat bot code luon trong cung prompt. Ban se mat checkpoint verdict va mat Gate 1.",
    turns: [
      {
        id: "raid-1",
        title: "Owner briefs the raid",
        ownerLine:
          "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.\nRepo: social-listening-v3\nMuc tieu: chay live case ngu-hoa-market-sentiment va tpbank-evo-general-feedback, doi chieu voi phase active, tao checkpoint verdict.\nRule: dung o checkpoint verdict, chua implement, chua deploy.",
        botMove:
          "linux_main giu section boundary, tao hoac resume ticket, roi dispatch sang Codex tren linuxvm voi repo `social-listening-v3` va audit gate ro rang.",
        codexMove:
          "Codex doc `.phase.json`, `docs/codex-product-loop.md`, current phase docs, va case pack de chon 1-2 live cases dung scope.",
        skills: ["social-listening-v3-product-loop", "social-listening-v3-production-audit"],
        artifacts: [".phase.json", "docs/codex-product-loop.md", "docs/production/case-packs/phase-9-core.json"],
        stopRule: "Van dang trong audit gate. Chua co branch, chua co code.",
        takeaway: "Prompt tot cho raid phai noi ro live hay artifact-only, case nao, va diem dung la checkpoint verdict.",
        activeRoles: ["owner", "linux_main", "codex"],
      },
      {
        id: "raid-2",
        title: "Bot keeps the loop alive",
        ownerLine: "Ban cho bot tiep tuc. Ban khong chen vao giua duong neu khong co blocker that.",
        botMove:
          "linux_main de Codex tu loop, chi giu contract: neu bi blocker that, can business decision, hoac can credential thi moi hoi nguoc.",
        codexMove:
          "Codex chay `scripts/run_production_case_pack.py`, theo doi `monitor_production_run.py`, va thu thap `bootstrap.json`, `latest_analysis.json`, `final_report.md`.",
        skills: ["social-listening-v3-production-audit"],
        artifacts: ["scripts/run_production_case_pack.py", "scripts/monitor_production_run.py", "reports/production/run-*/final_report.md"],
        stopRule: "Bot khong bao non. Chi hoi lai neu gap blocker that.",
        takeaway: "OpenClaw bot khong phai la coder. No la dispatcher co memory va stop rules.",
        activeRoles: ["linux_main", "codex"],
      },
      {
        id: "raid-3",
        title: "Codex writes the verdict",
        ownerLine: "Ban chua chot fix gi o day. Ban chi doi checkpoint verdict.",
        botMove:
          "linux_main tom lai run ids, artifact paths, va route suggestion, nhung khong tu chot contained-fix hay new-phase thay ban.",
        codexMove:
          "Codex viet `checkpoint-verdict-<timestamp>.md`, tra loi ro phase dat ky vong chua, user problem da giai quyet chua, va cai gi phai giu nguyen.",
        skills: ["social-listening-v3-production-audit", "blackbird-critical-review"],
        artifacts: ["docs/phases/<current-phase>/analysis/checkpoint-verdict-<timestamp>.md", "run packet refs", "route suggestion"],
        stopRule: "Dung lai o Human Gate 1.",
        takeaway: "Checkpoint verdict moi la loot cua quest nay. Chua co verdict thi chua duoc nhay vao implementation.",
        activeRoles: ["linux_main", "codex"],
      },
      {
        id: "raid-4",
        title: "Owner locks the route",
        ownerLine:
          "Chot huong: contained-fix.\nChi sua browser lease va closeout retry trong scope phase hien tai.\nDung social-listening-v3-phase-executor va dung o candidate summary.",
        botMove:
          "Bot ghi nhan huong da khoa. Tu day moi co the giao quest tiep theo cho agent phu hop, thuong la gaubot.",
        codexMove:
          "Codex chua code trong quest nay. No chi doi route lock ro rang roi moi mo quest execution.",
        skills: ["human-gate-1"],
        artifacts: ["direction lock", "next prompt"],
        stopRule: "Quest 1 ket thuc khi route da khoa.",
        takeaway: "Mot cau `Chot huong:` dung quan trong hon 20 cau mo ho.",
        activeRoles: ["owner"],
      },
    ],
  },
  {
    id: "contained-fix-sprint",
    title: "Quest 2: Contained Fix Sprint",
    difficulty: "Execution",
    objective: "Sua mot regression nho ma khong mo phase moi.",
    whenToPlay: "Khi checkpoint verdict cho thay van de van nam tron trong boundary phase da khoa.",
    winCondition: "Nhan candidate summary tren branch rieng, co patch docs, checkpoint plan, validation, va chua merge.",
    party: ["owner", "gaubot", "codex"],
    badMove: "Neu regression van nam trong scope phase hien tai ma ban mo phase moi, ban se lam workflow nang va cham hon muc can thiet.",
    turns: [
      {
        id: "fix-1",
        title: "Owner opens the execution gate",
        ownerLine:
          "@gaubot hay tro chuyen voi codex va dung skill social-listening-v3-phase-executor.\nRepo: social-listening-v3\nMuc tieu: latest main, branch moi, patch package toi thieu, checkpoint, implementation, validation, candidate summary.\nRule: dung o candidate summary, khong merge, khong deploy.",
        botMove:
          "gaubot nhan day la execution gate. No dispatch Codex voi route da khoa san va giu thoa thuan khong merge production.",
        codexMove:
          "Codex xac nhan direction lock, tim checkpoint verdict moi nhat, va chuan bi execution path tu latest main.",
        skills: ["social-listening-v3-phase-executor"],
        artifacts: ["checkpoint verdict moi nhat", "execution mode", "branch plan"],
        stopRule: "Neu huong chua khoa, Codex phai dung. Khong duoc code truoc.",
        takeaway: "Quest execute tot bat dau bang route lock + diem dung candidate summary.",
        activeRoles: ["owner", "gaubot", "codex"],
      },
      {
        id: "fix-2",
        title: "Codex syncs the world",
        ownerLine: "Ban khong can noi lai `git pull` hay `tao branch` neu prompt da khoa dung execution gate.",
        botMove:
          "gaubot chi giu context va doi evidence. No khong tu sua file. No de Codex thao tac tren working tree hoac worktree moi.",
        codexMove:
          "Codex `git checkout main`, `git pull`, kiem tra dirty workspace, tao worktree neu can, va tao branch `codex/<scope>`.",
        skills: ["social-listening-v3-phase-executor"],
        artifacts: ["workspace path", "worktree path neu co", "branch name"],
        stopRule: "Mot task = mot branch. Khong de nhieu agent sua cung working tree.",
        takeaway: "Gaubot la builder lead, Codex moi la worker thuc hien branch/worktree/docs/code.",
        activeRoles: ["gaubot", "codex"],
      },
      {
        id: "fix-3",
        title: "Patch package and checkpoints",
        ownerLine: "Ban chi can doc lai neu candidate package mo ho hoac vuot scope.",
        botMove:
          "gaubot co the yeu cau Codex dung `blackbird-delivery-control` neu can break checkpoint ro rang hon truoc khi code.",
        codexMove:
          "Codex tao `docs/phases/<current-phase>/patches/<date>-<slug>/phase-manifest.md`, checkpoint plan, va technical delta nho gon dung route contained-fix.",
        skills: ["social-listening-v3-phase-executor", "blackbird-delivery-control"],
        artifacts: ["phase-manifest.md", "checkpoint plan", "docs package path"],
        stopRule: "Contained-fix phai nho, scope hep, khong doi phase contract.",
        takeaway: "Khong phai quest nho thi bo docs. Quest nho van can patch manifest de sau nay ban doc lai duoc.",
        activeRoles: ["gaubot", "codex"],
      },
      {
        id: "fix-4",
        title: "Implementation and validation",
        ownerLine: "Ban de gaubot va Codex chay batch implementation den khi co validation summary.",
        botMove:
          "gaubot tap trung vao pacing va evidence. No khong hoi lai neu van con tu debug, test, va sua tiep duoc.",
        codexMove:
          "Codex code theo checkpoint, chay build/test can thiet, va ghi ro cai gi da pass, cai gi chua chay duoc, va vi sao.",
        skills: ["social-listening-v3-phase-executor", "implement-system-design"],
        artifacts: ["validation logs", "updated code", "evidence notes"],
        stopRule: "Khong merge. Khong deploy. Dung truoc Gate 2.",
        takeaway: "Codex la thang cam ban phim. Bot la thang giu discipline cua quest.",
        activeRoles: ["gaubot", "codex"],
      },
      {
        id: "fix-5",
        title: "Candidate summary drop",
        ownerLine:
          "Tot. Gui candidate summary de toi quyet merge/deploy hay replay them. Chua merge.",
        botMove:
          "gaubot tra lai workspace path, branch, docs package, validation summary, va candidate summary. No dung truoc merge gate.",
        codexMove:
          "Codex viet `candidate-summary.md` vao patch dir va neu ro changelog, validation, risk, va de xuat gate tiep theo.",
        skills: ["social-listening-v3-phase-executor", "human-gate-2"],
        artifacts: ["candidate-summary.md", "branch ref", "patch dir"],
        stopRule: "Human Gate 2 bat dau tu day.",
        takeaway: "Candidate summary khong phai lenh merge. No la cai de ban review.",
        activeRoles: ["owner", "gaubot", "codex"],
      },
    ],
  },
  {
    id: "new-phase-forge",
    title: "Quest 3: New Phase Forge",
    difficulty: "Tandem",
    objective: "Mo phase moi khi phase cu chay dung ky thuat nhung user problem van chua duoc khoa.",
    whenToPlay: "Khi checkpoint verdict cho thay can doi scope, boundary, contract, metrics, hoac phase package.",
    winCondition: "Co problem framing ro, phase docs ro, checkpoint ro, implementation ro, va candidate summary dung chuan.",
    party: ["owner", "lavis_linux", "gaubot", "codex"],
    badMove: "Neu khong cho lavis_linux hoac mot luot challenge scope truoc, ban de gaubot nhay vao code khi boundary van mo ho.",
    turns: [
      {
        id: "phase-1",
        title: "Owner asks for a sharper read",
        ownerLine:
          "@lavis_linux hay tro chuyen voi codex de phan tich checkpoint verdict nay.\nRepo: social-listening-v3\nMuc tieu: neu 3 root cause chinh, challenge scope, va goi y contained-fix hay new-phase.\nRule: chua code, chua merge, chi phan tich den khi ro huong.",
        botMove:
          "lavis_linux giu mode analysis-first. No khong day Codex sang implementation. No yeu cau lap luan va phase framing chac tay.",
        codexMove:
          "Codex doc checkpoint verdict, run packet, va neu can dung `blackbird-critical-review` hoac `product-analyst` de challenge route.",
        skills: ["blackbird-critical-review", "product-analyst", "social-listening-v3-product-loop"],
        artifacts: ["root cause summary", "scope challenge", "route recommendation"],
        stopRule: "Van dang o phan challenge va framing. Chua vao branch/code.",
        takeaway: "lavis_linux khong dung de fix file nhanh. No dung de tranh cho ban mo phase moi trong mo suong.",
        activeRoles: ["owner", "lavis_linux", "codex"],
      },
      {
        id: "phase-2",
        title: "Owner locks new-phase",
        ownerLine:
          "Chot huong: new-phase.\nPhase tiep theo phai giai quyet answer quality sau closeout va source memory giua cac run.\nDung social-listening-v3-phase-executor va dung o candidate summary.",
        botMove:
          "Bot ghi nhan day khong con la patch nho. Tu day quest se co docs package day du va execution may manh hon.",
        codexMove:
          "Codex nhan route lock va san sang tao phase dir moi, docs, checkpoints, va implementation slices.",
        skills: ["human-gate-1", "social-listening-v3-phase-executor"],
        artifacts: ["new-phase lock", "phase scope note"],
        stopRule: "Sau cau nay moi hop le de mo full phase package.",
        takeaway: "Gate 1 cua new-phase van chi nen la 1-2 cau ngan. Ro hon dai.",
        activeRoles: ["owner", "lavis_linux", "gaubot", "codex"],
      },
      {
        id: "phase-3",
        title: "Gaubot takes the forge",
        ownerLine:
          "@gaubot tiep tuc voi codex cho route new-phase nay.\nRepo: social-listening-v3\nMuc tieu: latest main, branch moi, phase package day du, checkpoint plan, implementation, validation, candidate summary.\nRule: dung o candidate summary.",
        botMove:
          "gaubot giu vai builder lead. No co the nhac Codex dung `blackbird-delivery-control` de chia checkpoint va `implement-system-design` de dich thiet ke thanh slices.",
        codexMove:
          "Codex tao `docs/phases/<next-phase>/README.md`, `ba-problem-brief.md`, `technical-solution.md`, `user-stories.md`, `phase-manifest.md`, va `checkpoints/README.md` truoc khi code.",
        skills: ["social-listening-v3-phase-executor", "blackbird-delivery-control", "implement-system-design"],
        artifacts: ["phase dir moi", "phase-manifest.md", "technical-solution.md", "checkpoint package"],
        stopRule: "Full docs package phai xuat hien truoc hoac song song voi code. Khong duoc lam mo.",
        takeaway: "Quest phase moi la luc gaubot va Codex xay ca blueprint, khong chi xay fix.",
        activeRoles: ["gaubot", "codex"],
      },
      {
        id: "phase-4",
        title: "Candidate summary before release",
        ownerLine: "Gui candidate summary sau khi docs, code, va validation da ro. Chua merge.",
        botMove:
          "gaubot dong quest execution bang summary ro: branch nao, docs package nao, checkpoint nao, validation nao, risk nao.",
        codexMove:
          "Codex chot `candidate-summary.md`, neu ro outcome mong doi, test da chay, cai gi con risky, va prompt tiep theo cho merge gate.",
        skills: ["social-listening-v3-phase-executor", "human-gate-2"],
        artifacts: ["candidate-summary.md", "validation summary", "next prompt for merge gate"],
        stopRule: "Quest chi xong o Gate 2, khong xong o commit.",
        takeaway: "Doc package va candidate summary la cach ban giu phase moi khong tro thanh mot dong code khong ten.",
        activeRoles: ["owner", "gaubot", "codex"],
      },
    ],
  },
  {
    id: "merge-revalidate",
    title: "Quest 4: Merge, Deploy, Revalidate",
    difficulty: "Release",
    objective: "Dung Gate 2 dung cach va dong vong bang production truth sau deploy.",
    whenToPlay: "Khi candidate summary da san sang va ban dang can quyet merge/deploy hay replay them.",
    winCondition: "Production duoc deploy an toan, case pack duoc chay lai, va ban biet co can mo vong tiep theo khong.",
    party: ["owner", "linux_main", "codex", "github"],
    badMove: "Loi nguy hiem nhat la coi candidate summary la lenh merge, roi deploy ma khong co revalidation quest sau cung.",
    turns: [
      {
        id: "release-1",
        title: "Owner reviews Gate 2",
        ownerLine:
          "@linux_mainbot hay tro chuyen voi codex va chuan bi merge/deploy gate cho candidate nay.\nRepo: social-listening-v3\nMuc tieu: tom tat candidate summary, neu ro neu merge se release cai gi, va dung truoc buoc merge.\nRule: khong merge neu toi chua chot.",
        botMove:
          "linux_main giu merge gate o muc he thong. No nhac lai branch, candidate summary, va release impact thay vi lao vao code.",
        codexMove:
          "Codex doc candidate summary, docs package, va validation summary de neu ro ban dang sap release cai gi va risk con lai la gi.",
        skills: ["social-listening-v3-product-loop", "human-gate-2"],
        artifacts: ["release summary", "merge gate prompt", "risk recap"],
        stopRule: "Chua merge neu owner chua noi ro.",
        takeaway: "Gate 2 la gate cua owner. Bot va Codex chi lam ro bang chung cho quyet dinh do.",
        activeRoles: ["owner", "linux_main", "codex"],
      },
      {
        id: "release-2",
        title: "The release world takes over",
        ownerLine:
          "Khong brainstorm them. Merge len main va trigger deploy production theo workflow chuan.",
        botMove:
          "OpenClaw bot co the nhac dung workflow va command, nhung build/deploy thuc te di qua GitHub Actions, GHCR, va production server.",
        codexMove:
          "Codex co the chi ra `scripts/trigger_production_deploy.sh` hoac `deploy-production.yml`, nhung no khong nen gia vo day la execution gate nua.",
        skills: ["build-image.yml", "deploy-production.yml"],
        artifacts: ["GitHub main", "GHCR image", "server release state"],
        stopRule: "Build va deploy khong xay ra trong working tree cua Codex. No xay ra o release world.",
        takeaway: "Trang nay day ro mot su that quan trong: OpenClaw/Codex giup ban den gate deploy, con release that di qua GitHub va server.",
        activeRoles: ["owner", "linux_main", "codex", "github"],
      },
      {
        id: "release-3",
        title: "Raid again after deploy",
        ownerLine:
          "@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.\nRepo: social-listening-v3\nMuc tieu: revalidate sau deploy bang dung case canary va so sanh delta voi run truoc.\nRule: dung o checkpoint verdict.",
        botMove:
          "linux_main mo lai production raid nhung lan nay co mot diem doi chieu rat ro: so voi candidate summary va run truoc deploy.",
        codexMove:
          "Codex chay lai audit, so sanh delta, va neu ro phase vua ship co that su tao outcome hay khong.",
        skills: ["social-listening-v3-production-audit", "blackbird-production-phase-loop"],
        artifacts: ["revalidation run packet", "post-deploy checkpoint verdict", "delta summary"],
        stopRule: "Neu outcome chua dat, vong lap quay lai Quest 1.",
        takeaway: "Deploy khong phai ending screen. Revalidation moi la man boss cuoi cua vong.",
        activeRoles: ["owner", "linux_main", "codex", "github"],
      },
    ],
  },
];

export function SocialListeningArena() {
  const { recordEvent } = useAcademyProgress();
  const [questId, setQuestId] = useState(quests[0].id);
  const [turnIndex, setTurnIndex] = useState(0);

  const quest = quests.find((item) => item.id === questId) ?? quests[0];
  const turn = quest.turns[turnIndex] ?? quest.turns[0];

  const activeRoleIds = Array.from(new Set<RoleId>(["owner", "codex", ...quest.party, ...turn.activeRoles]));

  async function selectQuest(nextQuestId: string) {
    setQuestId(nextQuestId);
    setTurnIndex(0);
    await recordEvent("arena_quest_selected", { questId: nextQuestId });
  }

  async function moveTurn(direction: -1 | 1) {
    const nextIndex = Math.min(Math.max(turnIndex + direction, 0), quest.turns.length - 1);
    setTurnIndex(nextIndex);
    await recordEvent("arena_turn_moved", {
      questId,
      turnIndex: nextIndex + 1,
    });
  }

  return (
    <>
      <Surface as="section" variant="hero" className="section-block stack-lg arena-hero">
        <div className="stack-sm">
          <p className="eyebrow">Dedicated demo page</p>
          <h1 className="display-title">Social Listening Arena</h1>
          <p className="hero-subtitle">
            Trang này chỉ dạy một việc: dùng OpenClaw bot để điều khiển Codex tiếp tục phát triển
            `social-listening-v3` đúng gate, đúng bot, đúng skill và đúng artifact.
          </p>
        </div>
        <div className="chip-row">
          <Chip variant="accent">Production truth first</Chip>
          <Chip variant="outline">2 human gates</Chip>
          <Chip variant="outline">Audit → Lock → Execute → Revalidate</Chip>
        </div>
        <div className="hero-actions">
          <LinkButton href="/prompt-lab" variant="primary" size="lg">
            Practice prompts first
          </LinkButton>
          <LinkButton href="/ops" variant="secondary" size="lg">
            Open runtime deck
          </LinkButton>
          <LinkButton href="/missions" variant="ghost" size="lg">
            Return to stage map
          </LinkButton>
        </div>
      </Surface>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">How to read this board</p>
          <h2 className="section-title">Một board duy nhất để đọc owner prompt, bot dispatch và Codex execution</h2>
        </div>
        <div className="arena-intro-grid">
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">You say</p>
            <p className="mission-summary">Câu prompt thật bạn nên nói với bot. Nếu gate sai, cả quest sẽ lệch.</p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Bot to Codex</p>
            <p className="mission-summary">
              Bot là dispatcher giữ ticket, boundary và stop rule. Nó không thay Codex làm việc kỹ thuật.
            </p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Codex does</p>
            <p className="mission-summary">
              Codex đọc skills, đọc repo, chạy lệnh, sửa file, tạo artifact và trả lại bằng chứng cho bot.
            </p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Loot / gate</p>
            <p className="mission-summary">
              Mỗi quest có một loot rõ ràng: checkpoint verdict hoặc candidate summary. Không có loot đó thì
              chưa được qua gate.
            </p>
          </Surface>
        </div>
      </PageSection>

      <div className="arena-layout">
        <aside className="quest-rail">
          <Surface as="section" variant="elevated" className="stack-sm">
            <p className="micro-label">Quest board</p>
            <div className="list-stack">
              {quests.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="quest-card stack-md"
                  data-active={item.id === quest.id}
                  onClick={() => {
                    void selectQuest(item.id);
                  }}
                >
                  <div className="chip-row">
                    <Chip variant="accent">{item.difficulty}</Chip>
                    <Chip variant="outline">{item.turns.length} turns</Chip>
                  </div>
                  <h2 className="mission-title">{item.title}</h2>
                  <p className="mission-summary">{item.objective}</p>
                </button>
              ))}
            </div>
          </Surface>

          <Surface as="section" variant="elevated" className="stack-sm">
            <p className="micro-label">Party for this quest</p>
            <div className="tag-row">
              {quest.party.map((roleId) => {
                const role = roles.find((item) => item.id === roleId);
                return <Chip key={roleId} variant="neutral">{role?.name ?? roleId}</Chip>;
              })}
            </div>
            <p className="muted-copy">{quest.whenToPlay}</p>
          </Surface>
        </aside>

        <Surface as="section" variant="hero" className="section-block stack-xl">
          <div className="chip-row">
            <Chip variant="accent">{quest.difficulty}</Chip>
            <Chip variant="outline">
              Turn {turnIndex + 1}/{quest.turns.length}
            </Chip>
          </div>
          <div className="stack-sm">
            <h2 className="section-title">{quest.title}</h2>
            <p className="section-copy">{quest.objective}</p>
          </div>

          <div className="arena-meta-grid">
            <Surface as="article" variant="subtle" className="stack-xs">
              <p className="micro-label">When to play</p>
              <p className="mission-summary">{quest.whenToPlay}</p>
            </Surface>
            <Surface as="article" variant="subtle" className="stack-xs">
              <p className="micro-label">Win condition</p>
              <p className="mission-summary">{quest.winCondition}</p>
            </Surface>
            <Surface as="article" variant="subtle" className="stack-xs">
              <p className="micro-label">Common bad move</p>
              <p className="mission-summary">{quest.badMove}</p>
            </Surface>
          </div>

          <div className="detail-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void moveTurn(-1);
              }}
              disabled={turnIndex == 0}
            >
              Previous turn
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                void moveTurn(1);
              }}
              disabled={turnIndex === quest.turns.length - 1}
            >
              Next turn
            </Button>
          </div>

          <div className="arena-turn-grid">
            <Surface as="article" variant="code" className="stack-xs">
              <p className="micro-label">{turn.title}</p>
              <pre className="example-prompt">
                <code>{turn.ownerLine}</code>
              </pre>
            </Surface>

            <Surface as="article" variant="subtle" className="stack-xs">
              <p className="micro-label">Bot interacts with Codex</p>
              <p className="mission-summary">{turn.botMove}</p>
            </Surface>

            <Surface as="article" variant="subtle" className="stack-xs">
              <p className="micro-label">Codex does</p>
              <p className="mission-summary">{turn.codexMove}</p>
            </Surface>

            <Surface as="article" variant="subtle" className="stack-sm">
              <p className="micro-label">Loot and stop rule</p>
              <ul className="list-copy">
                {turn.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
              <p className="muted-copy">{turn.stopRule}</p>
            </Surface>
          </div>

          <div className="arena-support-grid">
            <Surface as="article" variant="elevated" className="stack-sm">
              <p className="micro-label">Skill loadout</p>
              <div className="tag-row">
                {turn.skills.map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </Surface>

            <Surface as="article" variant="elevated" className="stack-xs">
              <p className="micro-label">Why this turn matters</p>
              <p className="muted-copy">{turn.takeaway}</p>
            </Surface>
          </div>
        </Surface>
      </div>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Party roles</p>
          <h2 className="section-title">Ai lam gi trong game nay</h2>
        </div>
        <div className="role-grid">
          {roles.map((role) => (
            <Surface
              key={role.id}
              as="article"
              variant="interactive"
              className="role-card stack-sm"
              data-active={activeRoleIds.includes(role.id)}
            >
              <div className="chip-row">
                <Chip variant="neutral">{role.classLabel}</Chip>
                {activeRoleIds.includes(role.id) ? <Chip variant="success">Active in quest</Chip> : null}
              </div>
              <h3 className="mission-title">{role.name}</h3>
              <p className="mission-summary">{role.summary}</p>
              <p className="muted-copy">{role.bestFor}</p>
              <div className="tag-row">
                {role.skills.map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </Surface>
          ))}
        </div>
      </PageSection>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Skill Atlas</p>
          <h2 className="section-title">Muốn tra cứu skill của host, Codex linuxvm và OpenClaw linuxvm ở một chỗ</h2>
          <p className="section-copy">
            Ngoài quest board, arena này còn có ba kho skill riêng. Bạn có thể tra cứu skill trên host, bundle
            Codex trên `linuxvm` và bundle OpenClaw trên `linuxvm`, rồi hỏi AI nên dùng skill nào cho đúng tình
            huống.
          </p>
        </div>
        <div className="hero-actions">
          <LinkButton href="/social-listening-arena/skills" variant="primary" size="lg">
            Codex host
          </LinkButton>
          <LinkButton href="/social-listening-arena/skills-vm-codex" variant="secondary" size="lg">
            Codex linuxvm
          </LinkButton>
          <LinkButton href="/social-listening-arena/skills-vm-openclaw" variant="secondary" size="lg">
            OpenClaw linuxvm
          </LinkButton>
        </div>
      </PageSection>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Feynman shortcuts</p>
          <h2 className="section-title">Những câu ngắn để nhớ đúng vai trò của từng actor</h2>
        </div>
        <div className="arena-intro-grid">
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Bot is not the coder</p>
            <p className="mission-summary">
              Bot giống như người đội trưởng giữ bối cảnh, ticket, stop rule và kết nối bạn với Codex.
            </p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Codex is the worker</p>
            <p className="mission-summary">
              Codex mới là thằng đọc file, chạy script, tạo branch, sửa code và viết artifact.
            </p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Owner controls the gates</p>
            <p className="mission-summary">
              Nếu bạn không nói `Chot huong:` hoặc `khong merge neu toi chua chot`, hệ thống sẽ phải đoán ý bạn.
            </p>
          </Surface>
          <Surface as="article" variant="subtle" className="stack-xs">
            <p className="micro-label">Production closes the loop</p>
            <p className="mission-summary">
              Deploy chỉ là ở giữa game. Revalidation trên production thật mới cho biết quest có thắng hay không.
            </p>
          </Surface>
        </div>
      </PageSection>
    </>
  );
}
