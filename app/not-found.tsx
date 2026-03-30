import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">404</p>
      <h1 className="section-title">Không tìm thấy nhiệm vụ này</h1>
      <p className="section-copy">Bạn quay lại lộ trình để chọn đúng nội dung, hoặc tiếp tục luyện prompt nếu muốn.</p>
      <div className="hero-actions" style={{ marginTop: "18px" }}>
        <Link href="/missions" className="button-primary">
          Về lộ trình
        </Link>
        <Link href="/prompt-lab" className="button-secondary">
          Mở Prompt Lab
        </Link>
      </div>
    </section>
  );
}
