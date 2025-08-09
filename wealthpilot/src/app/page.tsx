import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/quotes";

export default async function Page() {
  const [holdings, bankAccounts] = await Promise.all([
    prisma.holding.findMany(),
    prisma.bankAccount.findMany(),
  ]);

  const symbols = Array.from(new Set(holdings.map(h => h.symbol.toUpperCase())));
  const prices = new Map<string, number>();
  for (const s of symbols) {
    try { const q = await getQuote(s); prices.set(s, q.price); } catch {}
  }
  const equityValue = holdings.reduce((sum, h) => sum + h.quantity * (prices.get(h.symbol.toUpperCase()) ?? h.averagePrice), 0);
  const cash = bankAccounts.reduce((s, b) => s + (b.balance ?? 0), 0);
  const netWorth = equityValue + cash;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <Card title="Net Worth" value={`₹${netWorth.toFixed(0)}`} />
        <Card title="Equity" value={`₹${equityValue.toFixed(0)}`} />
        <Card title="Cash" value={`₹${cash.toFixed(0)}`} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 8, minWidth: 180 }}>
      <div style={{ color: "#666", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
