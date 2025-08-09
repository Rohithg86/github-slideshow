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
  // Expected headers: broker,accountNumber,account(optional),type,symbol(optional),quantity(optional),price(optional),fees(optional),date,note(optional)
  let imported = 0;
  for (const row of rows) {
    const broker = String(row.broker ?? row.Broker ?? "").trim();
    const accountNumber = String(row.accountNumber ?? row.AccountNumber ?? "").trim();
    if (!broker || !accountNumber) continue;
    const accountName = String(row.account ?? row.Account ?? broker).trim();

    const account = await prisma.brokerAccount.upsert({
      where: { accountNumber },
      update: { name: accountName, broker },
      create: { accountNumber, name: accountName, broker },
    });

    const type = String(row.type ?? row.Type ?? "").toUpperCase() as any;
    const symbol = row.symbol ? String(row.symbol).toUpperCase() : null;
    const quantity = row.quantity != null ? Number(row.quantity) : null;
    const price = row.price != null ? Number(row.price) : null;
    const fees = row.fees != null ? Number(row.fees) : 0;
    const date = new Date(row.date);
    const note = row.note ? String(row.note) : null;

    await prisma.transaction.create({
      data: {
        accountId: account.id,
        type,
        symbol: symbol ?? undefined,
        quantity: quantity ?? undefined,
        price: price ?? undefined,
        fees,
        date,
        note: note ?? undefined,
      },
    });
    imported += 1;
  }

  return NextResponse.json({ imported });
}