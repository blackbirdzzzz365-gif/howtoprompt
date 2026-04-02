"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAcademyProgress } from "@/components/app-provider";
import { Button, LinkButton } from "@/components/ui/button";

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
            <LinkButton
              key={item.href}
              href={item.href}
              variant="nav"
              data-active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            >
              {item.label}
            </LinkButton>
          ))}
          <Button variant="nav" onClick={toggleReducedMotion}>
            {hydrated && reducedMotion ? "Chuyển động: Tắt" : "Chuyển động: Bật"}
          </Button>
        </nav>
      </div>
    </header>
  );
}
