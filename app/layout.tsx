import type { Metadata } from "next";
import Link from "next/link";
import { AppProvider } from "@/components/app-provider";
import { ProgressRail } from "@/components/progress-rail";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenClaw x Codex | Học viện Mission Control",
  description:
    "Trang web tương tác giúp bạn học cách dùng OpenClaw x Codex qua lộ trình nhiệm vụ, Prompt Lab và mô phỏng tình huống.",
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
                <p className="eyebrow">Học viện Mission Control</p>
                <p className="footer-copy">
                  Nội dung được xây dựng từ{" "}
                  <Link href="/missions" className="inline-link">
                    6 nhiệm vụ
                  </Link>{" "}
                  và guide gốc để bạn có thể hiểu hệ thống, viết prompt đúng và vào việc nhanh hơn.
                </p>
              </div>
              <div className="footer-links">
                <Link href="/prompt-lab" className="inline-link">
                  Prompt Lab
                </Link>
                <Link href="/simulator" className="inline-link">
                  Mô phỏng
                </Link>
                <Link href="/quick-ref" className="inline-link">
                  Thẻ nhắc
                </Link>
                <Link href="/ops" className="inline-link">
                  Vận hành
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
