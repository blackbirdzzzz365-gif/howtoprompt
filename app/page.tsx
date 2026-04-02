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

const heroNotes = [
  {
    title: "Runtime-first handbook",
    body: "Không dạy prompt chung chung. Mọi stage đều bám Linux VM thật, gate thật và deploy/revalidate thật.",
  },
  {
    title: "Design system ready",
    body: "Missions, Prompt Lab và SL Arena giờ dùng cùng một visual grammar để team build feature mà không vá UI từng màn.",
  },
  {
    title: "Built for repeatability",
    body: "Owner có thể audit, khóa hướng, giao executor và quay lại production theo đúng một vòng lặp thống nhất.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-grid">
        <Surface variant="hero" className="hero-copy">
          <div className="stack-md">
            <p className="eyebrow">Verified runtime playbook</p>
            <h1 className="display-title">Play the product loop, not just the prompt.</h1>
            <p className="hero-subtitle">
              Website này biến operator guide authoritative thành một frontend product shell gọn, rõ và có thể
              scale thành handbook thực chiến cho OpenClaw x Codex trên Linux VM thật.
            </p>
          </div>

          <div className="hero-actions">
            <LinkButton href="/missions" variant="primary" size="lg">
              Open stage map
            </LinkButton>
            <LinkButton href="/social-listening-arena" variant="secondary" size="lg">
              Open SL arena
            </LinkButton>
            <LinkButton href="/prompt-lab" variant="secondary" size="lg">
              Practice gate prompts
            </LinkButton>
            <LinkButton href="/simulator" variant="ghost" size="lg">
              Run board simulator
            </LinkButton>
          </div>

          <div className="hero-kpi-grid">
            <Surface variant="metric">
              <div className="stack-xs">
                <p className="stat-label">Stages</p>
                <p className="stat-value">{missions.length}</p>
              </div>
            </Surface>
            <Surface variant="metric">
              <div className="stack-xs">
                <p className="stat-label">Quick refs</p>
                <p className="stat-value">{quickRefs.length}</p>
              </div>
            </Surface>
            <Surface variant="metric">
              <div className="stack-xs">
                <p className="stat-label">Human gates</p>
                <p className="stat-value">2</p>
              </div>
            </Surface>
          </div>
        </Surface>

        <div className="hero-side">
          <Surface variant="elevated" className="hero-preview stack-lg">
            <div className="stack-sm">
              <p className="micro-label">Loop snapshot</p>
              <h2 className="surface-title">Ship with gates, evidence and replay paths</h2>
              <p className="muted-copy">
                Đây là product loop được đóng gói lại thành frontend shell: từ audit production đến candidate
                summary và deploy gate.
              </p>
            </div>

            <div className="hero-flow-list">
              {loopSteps.map((item) => (
                <div key={item.step} className="hero-flow-card">
                  <div className="flow-step">{item.step}</div>
                  <div className="stack-xs">
                    <p className="mission-title">{item.title}</p>
                    <p className="mission-summary">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface variant="subtle" className="hero-preview stack-md">
            <div className="stack-xs">
              <p className="micro-label">Built for actual use</p>
              <h2 className="surface-title">What this handbook already packages</h2>
            </div>

            <div className="hero-note-list">
              {heroNotes.map((item) => (
                <div key={item.title} className="hero-note stack-xs">
                  <p className="mission-title">{item.title}</p>
                  <p className="mission-summary">{item.body}</p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Choose your path</p>
          <h2 className="section-title">Three ways in</h2>
          <p className="section-copy">
            Quick Raid cho lúc bạn cần production truth ngay. Full Campaign cho lúc bạn muốn học đúng cả vòng
            lặp. Release Gate cho lúc candidate summary đã sẵn sàng và bạn sắp chốt merge hay replay.
          </p>
        </div>
        <PathChooser paths={learningPaths} />
      </PageSection>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Core loop</p>
          <h2 className="section-title">Four turns, two human gates, one repeatable product loop</h2>
          <p className="section-copy">
            Đây là cách chơi đúng cho social-listening-v3 về sau: audit production thật, khóa hướng, thực thi
            phase, rồi merge hoặc replay. Sau deploy, quay lại audit để đóng vòng.
          </p>
        </div>
        <div className="loop-grid">
          {loopSteps.map((item) => (
            <Surface key={item.step} as="article" variant="subtle" className="stack-sm">
              <p className="micro-label">Turn {item.step}</p>
              <h3 className="mission-title">{item.title}</h3>
              <p className="mission-summary">{item.body}</p>
            </Surface>
          ))}
        </div>
      </PageSection>

      <PageSection strong className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Dedicated practice</p>
          <h2 className="section-title">Co mot trang rieng chi day OpenClaw bot x Codex cho social-listening-v3</h2>
          <p className="section-copy">
            Nếu bạn muốn xem đúng bài bản phối hợp với linux_main, lavis_linux, gaubot, Codex, GitHub và
            production trong dự án social listening, vào thẳng trang arena riêng. Nó có quest board, party
            roles và turn-by-turn demo cho production raid, contained-fix, new-phase và merge/revalidate.
          </p>
        </div>
        <div className="hero-actions">
          <LinkButton href="/social-listening-arena" variant="primary" size="lg">
            Enter social listening arena
          </LinkButton>
          <LinkButton href="/social-listening-arena/skills" variant="secondary" size="lg">
            Codex host atlas
          </LinkButton>
          <LinkButton href="/social-listening-arena/skills-vm-codex" variant="secondary" size="lg">
            Codex linuxvm atlas
          </LinkButton>
        </div>
      </PageSection>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Mission map</p>
          <h2 className="section-title">From runtime map to merge-or-replay</h2>
          <p className="section-copy">
            Mỗi stage giải quyết một quyết định lớn trong operator playbook: chọn đúng sân chơi, giữ gate, raid
            production, khóa hướng, giao executor và giữ merge gate.
          </p>
        </div>
        <MissionMap missions={missions} compact />
      </PageSection>

      <PageSection className="stack-lg">
        <div className="stack-sm">
          <p className="eyebrow">Bot classes</p>
          <h2 className="section-title">Ba class ban se goi nhieu nhat trong campaign nay</h2>
        </div>
        <div className="signal-grid">
          {botRoles.map((role) => (
            <Surface key={role.title} as="article" variant="subtle" className="stack-sm">
              <div className="chip-row">
                <div className="signal-dot" />
                <strong>{role.title}</strong>
              </div>
              <p className="mission-summary">{role.body}</p>
            </Surface>
          ))}
        </div>
      </PageSection>
    </>
  );
}
