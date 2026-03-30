import Link from "next/link";
import { MissionMap } from "@/components/mission-map";
import { PathChooser } from "@/components/path-chooser";
import { learningPaths, missions } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="hero-grid">
        <div className="panel hero-copy panel-strong">
          <p className="eyebrow">Phase 2 copy refresh</p>
          <h1 className="display-title">Học cách làm việc với OpenClaw x Codex theo một lộ trình dễ hiểu và có thể thực hành ngay.</h1>
          <p className="hero-subtitle">
            Trang web này chuyển bộ guide gốc thành một hành trình học ngắn gọn, rõ ràng và gần gũi hơn, để bạn
            có thể hiểu hệ thống, luyện prompt và xử lý tình huống thực tế mà không bị ngợp.
          </p>
          <div className="hero-actions">
            <Link href="/missions" className="button-primary">
              Xem lộ trình
            </Link>
            <Link href="/prompt-lab" className="button-secondary">
              Thử Prompt Lab
            </Link>
            <Link href="/simulator" className="button-ghost">
              Khám phá hệ thống
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Nhiệm vụ</p>
              <p className="stat-value">6</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Thẻ nhắc</p>
              <p className="stat-value">6</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Công cụ cốt lõi</p>
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
        <p className="eyebrow">Chọn cách bắt đầu</p>
        <h2 className="section-title">Ba lối vào theo đúng nhu cầu của bạn</h2>
        <p className="section-copy">
          Bạn có thể vào nhanh để dùng ngay, đi theo lộ trình đầy đủ để nắm chắc nền tảng, hoặc vào thẳng phần
          gỡ rối khi đang vướng blocker, xác thực hay ranh giới issue.
        </p>
        <PathChooser paths={learningPaths} />
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Lộ trình nhiệm vụ</p>
        <h2 className="section-title">Từ viết prompt đúng đến xử lý blocker và xác thực</h2>
        <p className="section-copy">
          Mỗi nhiệm vụ bám vào một ý quan trọng trong guide gốc: tư duy nền, cách viết prompt, ranh giới context,
          chọn bot phù hợp, hiểu hidden system và biết lúc nào cần can thiệp.
        </p>
        <MissionMap missions={missions} compact />
      </section>

      <section className="panel section-block">
        <p className="eyebrow">Nền tảng hiện tại</p>
        <h2 className="section-title">Phase 1 đã đủ chắc để tiếp tục mở rộng ở Phase 2</h2>
        <div className="signal-grid">
          <article className="signal-card">
            <div className="chip-row">
              <div className="signal-dot" />
              <strong>CP0-CP2</strong>
            </div>
            <p className="mission-summary" style={{ marginTop: "12px" }}>
              App shell, khung nội dung, hệ thống hình ảnh và bố cục responsive đã chạy ổn định.
            </p>
          </article>
          <article className="signal-card">
            <div className="chip-row">
              <div className="signal-dot" />
              <strong>CP3-CP5</strong>
            </div>
            <p className="mission-summary" style={{ marginTop: "12px" }}>
              Prompt Lab, trình mô phỏng, tiến độ học và thẻ nhắc nhanh đã kết nối với API và lưu trữ cục bộ.
            </p>
          </article>
          <article className="signal-card">
            <div className="chip-row">
              <div className="signal-dot" />
              <strong>CP6</strong>
            </div>
            <p className="mission-summary" style={{ marginTop: "12px" }}>
              Telemetry sự kiện, bảng theo dõi vận hành, reduced motion, điều hướng bàn phím và empty state đều đã sẵn sàng.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
