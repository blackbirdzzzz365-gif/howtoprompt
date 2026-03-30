import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel section-block panel-strong">
      <p className="eyebrow">404</p>
      <h1 className="section-title">Mission khong ton tai</h1>
      <p className="section-copy">Quay lai mission map de chon module dung hoac tiep tuc Prompt Lab.</p>
      <div className="hero-actions" style={{ marginTop: "18px" }}>
        <Link href="/missions" className="button-primary">
          Mission map
        </Link>
        <Link href="/prompt-lab" className="button-secondary">
          Prompt Lab
        </Link>
      </div>
    </section>
  );
}
