import { MissionMap } from "@/components/mission-map";
import { PathChooser } from "@/components/path-chooser";
import { LinkButton } from "@/components/ui/button";
import { PageSection } from "@/components/ui/layout";
import { Surface } from "@/components/ui/surface";
import { learningPaths, missions, quickRefs } from "@/lib/content";

const loopSteps = [
  {
    step: "01",
    title: "Production Raid",
    body: "Chay live truth, gom run packet, va dung o checkpoint verdict.",
  },
  {
    step: "02",
    title: "Direction Lock",
    body: "Owner chot contained-fix hoac new-phase. Day la human gate 1.",
  },
  {
    step: "03",
    title: "Phase Executor",
    body: "Lay latest main, tao branch, docs, checkpoint, code, validation, candidate summary.",
  },
  {
    step: "04",
    title: "Merge Or Replay",
    body: "Owner review candidate summary, merge/deploy hoac replay them, roi quay lai revalidate.",
  },
];

const botRoles = [
  {
    title: "linux_main",
    body: "Runtime, production audit, deploy gate, revalidation va integration proof.",
  },
  {
    title: "lavis_linux",
    body: "Analysis, root cause, review, scope challenge, contained-fix vs new-phase.",
  },
  {
    title: "gaubot",
    body: "Execution machine: branch, docs, checkpoints, code, validation, candidate summary.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-grid">
        <Surface variant="panelStrong" className="hero-copy">
          <p className="eyebrow">Verified runtime playbook</p>
          <h1 className="display-title">Play the product loop, not just the prompt.</h1>
          <p className="hero-subtitle">
            Website nay bien operator guide authoritative thanh mot campaign board co mission map, Prompt Lab,
            simulator, quick ref wallet va ops deck. Muc tieu la de ban dung OpenClaw va Codex dung gate, dung
            bot, dung runtime that tren linuxvm.
          </p>
          <div className="hero-actions">
            <LinkButton href="/missions" variant="primary">
              Open stage map
            </LinkButton>
            <LinkButton href="/social-listening-arena" variant="secondary">
              Open SL arena
            </LinkButton>
            <LinkButton href="/prompt-lab" variant="secondary">
              Practice gate prompts
            </LinkButton>
            <LinkButton href="/simulator" variant="ghost">
              Run board simulator
            </LinkButton>
          </div>

          <div className="stats-grid">
            <Surface variant="stat">
              <p className="stat-label">Stages</p>
              <p className="stat-value">{missions.length}</p>
            </Surface>
            <Surface variant="stat">
              <p className="stat-label">Quick refs</p>
              <p className="stat-value">{quickRefs.length}</p>
            </Surface>
            <Surface variant="stat">
              <p className="stat-label">Human gates</p>
              <p className="stat-value">2</p>
            </Surface>
          </div>
        </Surface>

        <Surface variant="panel" className="orbit-card">
          <div className="orbit-field" />
          <div className="orbit-ring" />
          <div className="orbit-ring-alt" />
          <div className="orbit-core" />
          <div className="orbit-node" data-slot="owner">
            owner
          </div>
          <div className="orbit-node" data-slot="bot">
            bot
          </div>
          <div className="orbit-node" data-slot="codex">
            codex
          </div>
          <div className="orbit-node" data-slot="repo">
            repo
          </div>
          <div className="orbit-node" data-slot="gate">
            gates
          </div>
          <div className="orbit-node" data-slot="prod">
            prod
          </div>
        </Surface>
      </section>

      <PageSection>
        <p className="eyebrow">Choose your path</p>
        <h2 className="section-title">Three ways in</h2>
        <p className="section-copy">
          Quick Raid cho luc ban can production truth ngay. Full Campaign cho luc ban muon hoc dung ca vong lap.
          Release Gate cho luc candidate summary da san sang va ban dang sap quyet merge hay replay.
        </p>
        <PathChooser paths={learningPaths} />
      </PageSection>

      <PageSection>
        <p className="eyebrow">Core loop</p>
        <h2 className="section-title">Four turns, two human gates, one repeatable product loop</h2>
        <p className="section-copy">
          Day la cach choi dung cho social-listening-v3 ve sau: audit production that, khoa huong, thuc thi phase,
          roi merge hoac replay. Sau deploy, quay lai audit de dong vong.
        </p>
        <div className="loop-grid">
          {loopSteps.map((item) => (
            <Surface key={item.step} as="article" variant="signal">
              <p className="micro-label">Turn {item.step}</p>
              <h3 className="mission-title" style={{ marginTop: "8px" }}>
                {item.title}
              </h3>
              <p className="mission-summary" style={{ marginTop: "10px" }}>
                {item.body}
              </p>
            </Surface>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <p className="eyebrow">Dedicated practice</p>
        <h2 className="section-title">Co mot trang rieng chi day OpenClaw bot x Codex cho social-listening-v3</h2>
        <p className="section-copy">
          Neu ban muon xem dung bai ban phoi hop voi linux_main, lavis_linux, gaubot, Codex, GitHub, va production
          trong du an social listening, vao thang trang arena rieng. No co quest board, party roles, va turn-by-turn
          demo cho production raid, contained-fix, new-phase, va merge/revalidate.
        </p>
        <div className="hero-actions">
          <LinkButton href="/social-listening-arena" variant="primary">
            Enter social listening arena
          </LinkButton>
          <LinkButton href="/social-listening-arena/skills" variant="secondary">
            Codex host atlas
          </LinkButton>
          <LinkButton href="/social-listening-arena/skills-vm-codex" variant="secondary">
            Codex linuxvm atlas
          </LinkButton>
        </div>
      </PageSection>

      <PageSection>
        <p className="eyebrow">Mission map</p>
        <h2 className="section-title">From runtime map to merge-or-replay</h2>
        <p className="section-copy">
          Moi stage giai quyet mot quyet dinh lon trong operator playbook: chon dung san choi, giu gate, raid
          production, khoa huong, giao executor, va giu merge gate.
        </p>
        <MissionMap missions={missions} compact />
      </PageSection>

      <PageSection>
        <p className="eyebrow">Bot classes</p>
        <h2 className="section-title">Ba class ban se goi nhieu nhat trong campaign nay</h2>
        <div className="signal-grid">
          {botRoles.map((role) => (
            <Surface key={role.title} as="article" variant="signal">
              <div className="chip-row">
                <div className="signal-dot" />
                <strong>{role.title}</strong>
              </div>
              <p className="mission-summary" style={{ marginTop: "12px" }}>
                {role.body}
              </p>
            </Surface>
          ))}
        </div>
      </PageSection>
    </>
  );
}
