"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAcademyProgress } from "@/components/app-provider";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/missions", label: "Lộ trình" },
  { href: "/prompt-lab", label: "Prompt Lab" },
  { href: "/simulator", label: "Mô phỏng" },
  { href: "/quick-ref", label: "Thẻ nhắc" },
  { href: "/ops", label: "Vận hành" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { completedMissionSlugs, reducedMotion, toggleReducedMotion, hydrated } = useAcademyProgress();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-lockup">
          <div className="brand-badge">OC</div>
          <div className="brand-text">
            <span className="eyebrow">OpenClaw x Codex</span>
            <span className="brand-title">Học viện Mission Control</span>
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
            {hydrated && reducedMotion ? "Hiệu ứng: Giảm" : "Hiệu ứng: Đầy đủ"}
          </button>
          <div className="header-pulse">{hydrated ? completedMissionSlugs.length : 0}/6 nhiệm vụ đã xong</div>
        </nav>
      </div>
    </header>
  );
}
