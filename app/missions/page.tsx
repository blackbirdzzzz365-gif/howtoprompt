import { MissionMap } from "@/components/mission-map";
import { missions } from "@/lib/content";

export default function MissionsPage() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">Lộ trình nhiệm vụ</p>
      <h1 className="section-title">6 nhiệm vụ bám sát guide gốc</h1>
      <p className="section-copy">
        Đây là phiên bản cô đọng từ 15 section trong guide gốc, được sắp lại thành 6 nhiệm vụ để bạn học, thực
        hành và mở khóa các thẻ nhắc quan trọng.
      </p>
      <MissionMap missions={missions} />
    </section>
  );
}
