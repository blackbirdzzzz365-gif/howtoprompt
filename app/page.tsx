import Link from "next/link";
import { MissionMap } from "@/components/mission-map";
import { PathChooser } from "@/components/path-chooser";
import { learningPaths, missions } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="hero-grid">
        <div className="panel hero-copy panel-strong">
          <p className="eyebrow">Phase 1 build</p>
          <h1 className="display-title">Learn the system like a mission control runbook you can play.</h1>
          <p className="hero-subtitle">
            Website nay bien guide authoritative thanh mot academy co mission map, Prompt Lab, hidden-system
            simulator, quick reference wallet va progress nhe de ban prompt dung ngay tu dau.
          </p>
          <div className="hero-actions">
            <Link href="/missions" className="button-primary">
              Open mission map
            </Link>
            <Link href="/prompt-lab" className="button-secondary">
              Practice a prompt
            </Link>
            <Link href="/simulator" className="button-ghost">
              See hidden system
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Missions</p>
              <p className="stat-value">6</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Quick refs</p>
              <p className="stat-value">6</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Core tools</p>
              <p className="stat-value">3</p>
            </div>
          </div>
        </div>

        <div className="panel orbit-card">
          <div className="orbit-field" />
          <div className="orbit-ring" />
          <div className="orbit-ring-alt" />
          <div className="orbit-core" />
          <div className="orbit-node" data-slot="section">
            section
          </div>
          <div className="orbit-node" data-slot="ticket">
            ticket
          </div>
          <div className="orbit-node" data-slot="context">
            context
          </div>
          <div className="orbit-node" data-slot="loop">
            loop
          </div>
        </div>
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Choose your path</p>
        <h2 className="section-title">Three ways in</h2>
        <p className="section-copy">
          Fast-start cho owner can dispatch ngay. Deep-dive cho onboarding day du. Troubleshoot cho luc auth,
          issue boundary hoac stop rules dang gay dau.
        </p>
        <PathChooser paths={learningPaths} />
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Mission map</p>
        <h2 className="section-title">From prompt formula to auth recovery</h2>
        <p className="section-copy">
          Moi mission giai quyet mot diem tri nho cua guide goc: mental model, prompt shape, issue boundary, bot
          routing, hidden system va stop rules.
        </p>
        <MissionMap missions={missions} compact />
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Phase 1 outcomes</p>
        <h2 className="section-title">Da build xong toan bo CP theo huong MVP co the mo rong</h2>
        <div className="signal-grid">
          <article className="signal-card">
            <div className="chip-row">
              <div className="signal-dot" />
              <strong>CP0-CP2</strong>
            </div>
            <p className="mission-summary" style={{ marginTop: "12px" }}>
              App shell, content contract, visual system, motion va responsive layout da hoat dong.
            </p>
          </article>
          <article className="signal-card">
            <div className="chip-row">
              <div className="signal-dot" />
              <strong>CP3-CP5</strong>
            </div>
            <p className="mission-summary" style={{ marginTop: "12px" }}>
              Prompt Lab, simulator, progress va quick ref wallet da noi voi API va persistence local/file.
            </p>
          </article>
          <article className="signal-card">
            <div className="chip-row">
              <div className="signal-dot" />
              <strong>CP6</strong>
            </div>
            <p className="mission-summary" style={{ marginTop: "12px" }}>
              Event telemetry, ops summary, reduced-motion, keyboard-friendly controls va empty states da co.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
