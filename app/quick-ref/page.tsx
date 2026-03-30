import { QuickRefWallet } from "@/components/quick-ref-wallet";
import { quickRefs } from "@/lib/content";

export default function QuickRefPage() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">Thẻ nhắc nhanh</p>
      <h1 className="section-title">Những tấm thẻ ngắn gọn để bạn dùng lại mỗi ngày</h1>
      <p className="section-copy">
        Các thẻ nhắc chỉ mở khóa khi bạn hoàn thành nhiệm vụ liên quan. Mục tiêu là để bạn quay lại dùng nhanh,
        không phải lật lại toàn bộ guide mỗi lần cần viết prompt.
      </p>
      <div style={{ marginTop: "20px" }}>
        <QuickRefWallet items={quickRefs} />
      </div>
    </section>
  );
}
