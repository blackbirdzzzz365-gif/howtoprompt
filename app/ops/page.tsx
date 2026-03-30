import { OpsSummary } from "@/components/ops-summary";

export default function OpsPage() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">Theo dõi vận hành</p>
      <h1 className="section-title">Ảnh chụp nhanh về telemetry và tiến độ học</h1>
      <p className="section-copy">
        Trang này giúp bạn nhìn nhanh xem người dùng đang tương tác ra sao, phần nào đang trơn tru và chỗ nào có
        dấu hiệu bị nghẽn trong hành trình học.
      </p>
      <div style={{ marginTop: "22px" }}>
        <OpsSummary />
      </div>
    </section>
  );
}
