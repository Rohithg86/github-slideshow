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
  // Expected headers: institution,accountNumber,account(optional),balance(optional),date,amount,type(DEBIT|CREDIT),description(optional),category(optional)
  let importedAccounts = 0;
  let importedTxns = 0;
  for (const row of rows) {
    const institution = String(row.institution ?? row.Bank ?? "").trim();
    const accountNumber = String(row.accountNumber ?? row.AccountNumber ?? "").trim();
    if (!institution || !accountNumber) continue;
    const name = String(row.account ?? row.Account ?? institution).trim();
    const balance = row.balance != null ? Number(row.balance) : undefined;

    const account = await prisma.bankAccount.upsert({
      where: { accountNumber },
      update: { institution, name, ...(balance != null ? { balance } : {}) },
      create: { institution, name, accountNumber, balance: balance ?? 0 },
    });
    importedAccounts += 1;

    // Transaction row may be present
    if (row.date && row.amount) {
      const amount = Number(row.amount);
      const type = String(row.type ?? (amount < 0 ? "DEBIT" : "CREDIT")).toUpperCase() as any;
      const description = String(row.description ?? row.Description ?? "").trim() || null;
      const category = String(row.category ?? row.Category ?? "").trim() || null;
      const date = new Date(row.date);

      await prisma.bankTransaction.create({
        data: {
          bankAccountId: account.id,
          date,
          amount: Math.abs(amount),
          type,
          description,
          category,
        },
      });
      importedTxns += 1;
    }
  }

  return NextResponse.json({ importedAccounts, importedTxns });
}