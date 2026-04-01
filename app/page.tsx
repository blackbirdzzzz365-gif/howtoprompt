import Link from "next/link";
import { MissionMap } from "@/components/mission-map";
import { PathChooser } from "@/components/path-chooser";
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
        <div className="panel hero-copy panel-strong">
          <p className="eyebrow">Verified runtime playbook</p>
          <h1 className="display-title">Play the product loop, not just the prompt.</h1>
          <p className="hero-subtitle">
            Website nay bien operator guide authoritative thanh mot campaign board co mission map, Prompt Lab,
            simulator, quick ref wallet va ops deck. Muc tieu la de ban dung OpenClaw va Codex dung gate, dung
            bot, dung runtime that tren linuxvm.
          </p>
          <div className="hero-actions">
            <Link href="/missions" className="button-primary">
              Open stage map
            </Link>
            <Link href="/social-listening-arena" className="button-secondary">
              Open SL arena
            </Link>
            <Link href="/prompt-lab" className="button-secondary">
              Practice gate prompts
            </Link>
            <Link href="/simulator" className="button-ghost">
              Run board simulator
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Stages</p>
              <p className="stat-value">{missions.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Quick refs</p>
              <p className="stat-value">{quickRefs.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Human gates</p>
              <p className="stat-value">2</p>
            </div>
          </div>
        </div>

        <div className="panel orbit-card">
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
        </div>
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Choose your path</p>
        <h2 className="section-title">Three ways in</h2>
        <p className="section-copy">
          Quick Raid cho luc ban can production truth ngay. Full Campaign cho luc ban muon hoc dung ca vong lap.
          Release Gate cho luc candidate summary da san sang va ban dang sap quyet merge hay replay.
        </p>
        <PathChooser paths={learningPaths} />
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Core loop</p>
        <h2 className="section-title">Four turns, two human gates, one repeatable product loop</h2>
        <p className="section-copy">
          Day la cach choi dung cho social-listening-v3 ve sau: audit production that, khoa huong, thuc thi phase,
          roi merge hoac replay. Sau deploy, quay lai audit de dong vong.
        </p>
        <div className="loop-grid">
          {loopSteps.map((item) => (
            <article key={item.step} className="signal-card">
              <p className="micro-label">Turn {item.step}</p>
              <h3 className="mission-title" style={{ marginTop: "8px" }}>
                {item.title}
              </h3>
              <p className="mission-summary" style={{ marginTop: "10px" }}>
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Dedicated practice</p>
        <h2 className="section-title">Co mot trang rieng chi day OpenClaw bot x Codex cho social-listening-v3</h2>
        <p className="section-copy">
          Neu ban muon xem dung bai ban phoi hop voi linux_main, lavis_linux, gaubot, Codex, GitHub, va production
          trong du an social listening, vao thang trang arena rieng. No co quest board, party roles, va turn-by-turn
          demo cho production raid, contained-fix, new-phase, va merge/revalidate.
        </p>
        <div className="hero-actions">
          <Link href="/social-listening-arena" className="button-primary">
            Enter social listening arena
          </Link>
          <Link href="/social-listening-arena/skills" className="button-secondary">
            Open skill atlas
          </Link>
        </div>
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Mission map</p>
        <h2 className="section-title">From runtime map to merge-or-replay</h2>
        <p className="section-copy">
          Moi stage giai quyet mot quyet dinh lon trong operator playbook: chon dung san choi, giu gate, raid
          production, khoa huong, giao executor, va giu merge gate.
        </p>
        <MissionMap missions={missions} compact />
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Bot classes</p>
        <h2 className="section-title">Ba class ban se goi nhieu nhat trong campaign nay</h2>
        <div className="signal-grid">
          {botRoles.map((role) => (
            <article key={role.title} className="signal-card">
              <div className="chip-row">
                <div className="signal-dot" />
                <strong>{role.title}</strong>
              </div>
              <p className="mission-summary" style={{ marginTop: "12px" }}>
                {role.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
