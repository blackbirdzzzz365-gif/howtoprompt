import type { Metadata } from "next";
import Link from "next/link";
import { AppProvider } from "@/components/app-provider";
import { ProgressRail } from "@/components/progress-rail";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenClaw x Codex Operator Campaign",
  description:
    "Interactive handbook de hoc va choi dung product loop OpenClaw x Codex tren runtime Linux VM that.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full">
        <AppProvider>
          <div className="app-shell">
            <div className="app-backdrop" aria-hidden="true" />
            <SiteHeader />
            <main className="page-frame">{children}</main>
            <footer className="site-footer">
              <div>
                <p className="eyebrow">Operator Campaign</p>
                <p className="footer-copy">
                  Duoc xay tu{" "}
                  <Link href="/missions" className="inline-link">
                    6 stages
                  </Link>{" "}
                  va guide authoritative de day owner dung product loop dung gate va dung bot.
                </p>
              </div>
              <div className="footer-links">
                <Link href="/prompt-lab" className="inline-link">
                  Prompt Lab
                </Link>
                <Link href="/social-listening-arena" className="inline-link">
                  SL Arena
                </Link>
                <Link href="/simulator" className="inline-link">
                  Simulator
                </Link>
                <Link href="/quick-ref" className="inline-link">
                  Quick Ref
                </Link>
                <Link href="/ops" className="inline-link">
                  Ops
                </Link>
              </div>
            </footer>
            <ProgressRail />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
