import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/quotes";

export type RecommendationInsight = {
  action: "BUY" | "SELL" | "HOLD" | "REBALANCE" | "MOVE_TO_MF";
  symbol?: string;
  score: number; // 0..1
  rationale: string;
  targetWeight?: number;
};

export async function generateRecommendations(): Promise<RecommendationInsight[]> {
  const [holdings, bankAccounts] = await Promise.all([
    prisma.holding.findMany(),
    prisma.bankAccount.findMany(),
  ]);

  // Compute portfolio value with live quotes
  const symbolSet = Array.from(new Set(holdings.map(h => h.symbol.toUpperCase())));
  const quotes = new Map<string, number>();
  for (const sym of symbolSet) {
    try {
      const q = await getQuote(sym);
      quotes.set(sym.toUpperCase(), q.price);
    } catch {
      // ignore symbol that fails
    }
  }

  const holdingValues = holdings.map(h => {
    const price = quotes.get(h.symbol.toUpperCase()) ?? h.averagePrice;
    return { ...h, value: h.quantity * price };
  });

  const totalEquityValue = holdingValues.reduce((s, h) => s + h.value, 0);
  const totalCash = bankAccounts.reduce((s, b) => s + (b.balance ?? 0), 0);

  const insights: RecommendationInsight[] = [];

  // Rebalance towards target allocations
  const withTargets = holdingValues.filter(h => typeof h.targetAllocation === "number");
  if (totalEquityValue > 0) {
    for (const h of withTargets) {
      const currentWeight = h.value / totalEquityValue;
      const target = (h.targetAllocation ?? 0);
      const diff = target - currentWeight;
      if (Math.abs(diff) > 0.03) {
        const action = diff > 0 ? "BUY" : "SELL";
        insights.push({
          action: "REBALANCE",
          symbol: h.symbol,
          score: Math.min(1, Math.abs(diff) / 0.2),
          targetWeight: target,
          rationale: `${action} to move ${h.symbol} from ${(currentWeight*100).toFixed(1)}% to target ${(target*100).toFixed(1)}%`,
        });
      }
    }
  }

  // Idle cash to MF suggestion
  if (totalCash > 0) {
    insights.push({
      action: "MOVE_TO_MF",
      score: Math.min(1, totalCash / Math.max(1, totalEquityValue + totalCash)),
      rationale: `Consider moving idle cash of ₹${totalCash.toFixed(0)} to a liquid MF for better yield`,
    });
  }

  // Concentration risk: any symbol > 25%
  for (const h of holdingValues) {
    const weight = totalEquityValue > 0 ? h.value / totalEquityValue : 0;
    if (weight > 0.25) {
      insights.push({
        action: "SELL",
        symbol: h.symbol,
        score: Math.min(1, (weight - 0.25) / 0.25),
        rationale: `${h.symbol} forms ${(weight*100).toFixed(1)}% of equity; consider trimming to reduce concentration risk`,
      });
    }
  }

  return insights.sort((a, b) => b.score - a.score);
}