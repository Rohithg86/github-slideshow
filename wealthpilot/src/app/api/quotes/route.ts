import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/quotes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  try {
    const q = await getQuote(symbol);
    return NextResponse.json(q);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 500 });
  }
}