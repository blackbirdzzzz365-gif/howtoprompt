"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAcademyProgress } from "@/components/app-provider";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/missions", label: "Missions" },
  { href: "/social-listening-arena", label: "SL Arena" },
  { href: "/social-listening-arena/skills", label: "Skill Atlas" },
  { href: "/prompt-lab", label: "Prompt Lab" },
  { href: "/simulator", label: "Simulator" },
  { href: "/quick-ref", label: "Quick Ref" },
  { href: "/ops", label: "Ops" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { reducedMotion, toggleReducedMotion, hydrated } = useAcademyProgress();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-lockup">
          <div className="brand-badge">OC</div>
          <div className="brand-text">
            <span className="eyebrow">OpenClaw x Codex</span>
            <span className="brand-title">Operator Campaign</span>
          </div>
        </Link>

        <nav className="header-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              data-active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            >
              {item.label}
            </Link>
          ))}
          <button type="button" className="nav-link" onClick={toggleReducedMotion}>
            {hydrated && reducedMotion ? "Chuyển động: Tắt" : "Chuyển động: Bật"}
          </button>
        </nav>
      </div>
    </header>
  );
}
