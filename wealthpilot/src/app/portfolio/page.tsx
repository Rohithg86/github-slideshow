import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/quotes";

export default async function PortfolioPage() {
  const holdings = await prisma.holding.findMany({ include: { account: true } });
  const symbols = Array.from(new Set(holdings.map(h => h.symbol.toUpperCase())));
  const prices = new Map<string, number>();
  for (const s of symbols) {
    try { const q = await getQuote(s); prices.set(s, q.price); } catch {}
  }
  const rows = holdings.map(h => {
    const price = prices.get(h.symbol.toUpperCase()) ?? h.averagePrice;
    const value = h.quantity * price;
    const pnl = (price - h.averagePrice) * h.quantity;
    return { ...h, accountName: h.account.name, price, value, pnl };
  });
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      <h2>Portfolio</h2>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Avg Price</th>
            <th>Live Price</th>
            <th>Value</th>
            <th>PnL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.accountName}</td>
              <td>{r.symbol}</td>
              <td>{r.quantity}</td>
              <td>{r.averagePrice.toFixed(2)}</td>
              <td>{r.price.toFixed(2)}</td>
              <td>{r.value.toFixed(2)}</td>
              <td style={{ color: r.pnl >= 0 ? "green" : "crimson" }}>{r.pnl.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} style={{ textAlign: "right" }}>Total</td>
            <td>{total.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}