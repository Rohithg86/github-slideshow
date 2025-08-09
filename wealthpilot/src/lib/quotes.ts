import yahooFinance from "yahoo-finance2";
import { prisma } from "@/lib/prisma";

export async function getQuote(symbol: string) {
  const normalized = symbol.trim().toUpperCase();
  const cache = await prisma.priceCache.findUnique({ where: { symbol: normalized } });
  const now = new Date();
  if (cache && now.getTime() - cache.asOf.getTime() < 1000 * 60 * 5) {
    return { symbol: normalized, price: cache.price, currency: cache.currency, asOf: cache.asOf };
    }

  try {
    const quote = await yahooFinance.quote(normalized);
    const price = quote.regularMarketPrice ?? quote.postMarketPrice ?? quote.preMarketPrice;
    const currency = quote.currency ?? "INR";
    if (typeof price === "number") {
      const upserted = await prisma.priceCache.upsert({
        where: { symbol: normalized },
        create: { symbol: normalized, price, currency },
        update: { price, currency, asOf: new Date() },
      });
      return { symbol: normalized, price: upserted.price, currency: upserted.currency, asOf: upserted.asOf };
    }
  } catch (e) {
    // ignore and fall back to cache if exists
  }

  if (cache) return { symbol: cache.symbol, price: cache.price, currency: cache.currency, asOf: cache.asOf };
  throw new Error(`Unable to fetch quote for ${normalized}`);
}