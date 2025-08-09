import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    return NextResponse.json({ error: parsed.errors[0].message }, { status: 400 });
  }
  const rows = parsed.data as any[];
  // Expected headers: broker,account,name(optional),accountNumber,symbol,isin(optional),quantity,averagePrice,type(optional EQUITY|MF),targetAllocation(optional)
  const created: string[] = [];
  for (const row of rows) {
    const broker = String(row.broker ?? row.Broker ?? "").trim();
    const accountNumber = String(row.accountNumber ?? row.AccountNumber ?? "").trim();
    const accountName = String(row.account ?? row.Account ?? row.name ?? "").trim() || broker;
    if (!broker || !accountNumber) continue;

    const account = await prisma.brokerAccount.upsert({
      where: { accountNumber },
      update: { name: accountName, broker },
      create: { accountNumber, name: accountName, broker },
    });

    const symbol = String(row.symbol ?? row.Symbol ?? "").trim().toUpperCase();
    if (!symbol) continue;
    const isin = row.isin ?? row.ISIN ?? null;
    const quantity = Number(row.quantity ?? row.Qty ?? row.quantityUnits ?? 0);
    const averagePrice = Number(row.averagePrice ?? row.AvgPrice ?? row.price ?? 0);
    const type = String(row.type ?? row.Type ?? "EQUITY").toUpperCase() as any;
    const targetAllocation = row.targetAllocation != null ? Number(row.targetAllocation) : undefined;

    await prisma.holding.upsert({
      where: { id: `${account.id}:${symbol}` },
      update: { quantity, averagePrice, isin, type, targetAllocation },
      create: {
        id: `${account.id}:${symbol}`,
        symbol,
        isin,
        quantity,
        averagePrice,
        type,
        targetAllocation,
        accountId: account.id,
      },
    });

    created.push(`${account.name}:${symbol}`);
  }

  return NextResponse.json({ imported: created.length, items: created });
}