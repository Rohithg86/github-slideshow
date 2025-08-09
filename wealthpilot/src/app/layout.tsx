import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "WealthPilot",
  description: "Consolidate portfolios, accounts and get investment insights",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 16 }}>
          <Link href="/">Dashboard</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/accounts">Accounts</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/recommendations">Recommendations</Link>
          <Link href="/upload">Upload</Link>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
