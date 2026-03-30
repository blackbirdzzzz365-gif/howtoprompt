import { OpsSummary } from "@/components/ops-summary";

export default function OpsPage() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">CP6 hardening</p>
      <h1 className="section-title">Ops snapshot and telemetry</h1>
      <p className="section-copy">
        Trang nay cho owner xem event funnel co ban de biet Prompt Lab, simulator va mission loop dang bi nghen
        o dau.
      </p>
      <div style={{ marginTop: "22px" }}>
        <OpsSummary />
      </div>
    </section>
  );
}
