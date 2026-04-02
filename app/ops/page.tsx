import { OpsSummary } from "@/components/ops-summary";
import { PageSection } from "@/components/ui/layout";
import { Surface } from "@/components/ui/surface";

const runtimeFacts = [
  {
    title: "True runtime",
    body: "OpenClaw x Codex runtime that dang chay tren linuxvm (openclawlinus), khong phai chiasegpu-vm.",
  },
  {
    title: "Verified bots",
    body: "linux_main, lavis_linux va gaubot deu co the goi Codex qua codex-telegram-dispatch va codex-supervisor.",
  },
  {
    title: "Path compatibility",
    body: "Absolute path /Users/nguyenquocthong/... da duoc map sang /home/blackbird/... de Codex skills tren Linux VM van resolve dung.",
  },
];

const commandDeck = [
  {
    title: "Find repo on linuxvm",
    command: "repo-path social-listening-v3",
  },
  {
    title: "Call Codex directly on linuxvm",
    command: "codex exec 'Doc skill product loop va liet ke ten 3 skill social-listening-v3'",
  },
  {
    title: "Dispatch from bot wrapper",
    command:
      "codex-telegram-dispatch --bot linux_main --repo social-listening-v3 --wait --message 'hay tro chuyen voi codex va dung skill social-listening-v3-production-audit'",
  },
  {
    title: "Observe runtime tickets",
    command: "ls ~/.openclaw/codex-supervisor/runtime/tickets && ls ~/.openclaw/runtime",
  },
];

export default function OpsPage() {
  return (
    <>
      <PageSection strong>
        <p className="eyebrow">Runtime deck</p>
        <h1 className="section-title">Operator facts va command deck tren linuxvm</h1>
        <p className="section-copy">
          Day la lop facts giup ban khong bi nham may, nham wrapper, hay nham runtime khi lam viec voi OpenClaw
          va Codex.
        </p>

        <div className="runtime-grid" style={{ marginTop: "22px" }}>
          {runtimeFacts.map((item) => (
            <Surface key={item.title} as="article" variant="detail">
              <p className="micro-label">{item.title}</p>
              <p className="mission-summary" style={{ marginTop: "8px" }}>
                {item.body}
              </p>
            </Surface>
          ))}
        </div>

        <div className="command-grid" style={{ marginTop: "22px" }}>
          {commandDeck.map((item) => (
            <Surface key={item.title} as="article" variant="detail">
              <p className="micro-label">{item.title}</p>
              <pre className="example-prompt" style={{ marginTop: "10px" }}>
                <code>{item.command}</code>
              </pre>
            </Surface>
          ))}
        </div>
      </PageSection>

      <PageSection strong>
        <p className="eyebrow">Telemetry</p>
        <h2 className="section-title">Ops snapshot and learning funnel</h2>
        <p className="section-copy">
          Trang nay cho owner xem event funnel co ban de biet Prompt Lab, simulator va stage loop dang bi nghen
          o dau.
        </p>
        <div style={{ marginTop: "22px" }}>
          <OpsSummary />
        </div>
      </PageSection>
    </>
  );
}
