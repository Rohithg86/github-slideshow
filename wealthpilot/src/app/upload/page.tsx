"use client";

import { useState } from "react";

export default function UploadPage() {
  const [status, setStatus] = useState<string>("");

  async function upload(endpoint: string, file: File | null) {
    if (!file) return setStatus("Please choose a file");
    const form = new FormData();
    form.append("file", file);
    setStatus("Uploading...");
    const res = await fetch(endpoint, { method: "POST", body: form });
    const json = await res.json();
    setStatus(res.ok ? JSON.stringify(json) : `Error: ${json.error ?? "failed"}`);
  }

  return (
    <div>
      <h2>Upload CSV</h2>

      <section style={{ marginBottom: 24 }}>
        <h3>Holdings</h3>
        <p>Headers: broker,account,accountNumber,symbol,quantity,averagePrice,type,targetAllocation</p>
        <input type="file" accept=".csv" onChange={e => upload("/api/import/holdings", e.target.files?.[0] ?? null)} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Broker Transactions</h3>
        <p>Headers: broker,account,accountNumber,type,symbol,quantity,price,fees,date,note</p>
        <input type="file" accept=".csv" onChange={e => upload("/api/import/transactions", e.target.files?.[0] ?? null)} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Bank Accounts & Transactions</h3>
        <p>Headers: institution,account,accountNumber,balance,date,amount,type,description,category</p>
        <input type="file" accept=".csv" onChange={e => upload("/api/import/bank", e.target.files?.[0] ?? null)} />
      </section>

      <div>{status}</div>
    </div>
  );
}