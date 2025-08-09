import { prisma } from "@/lib/prisma";

export default async function TransactionsPage() {
  const [brokerTxns, bankTxns] = await Promise.all([
    prisma.transaction.findMany({ include: { account: true }, orderBy: { date: "desc" } }),
    prisma.bankTransaction.findMany({ include: { bankAccount: true }, orderBy: { date: "desc" } }),
  ]);

  return (
    <div>
      <h2>Transactions</h2>
      <h3>Broker</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Type</th>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Fees</th>
          </tr>
        </thead>
        <tbody>
          {brokerTxns.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.account.name}</td>
              <td>{t.type}</td>
              <td>{t.symbol ?? "-"}</td>
              <td>{t.quantity ?? "-"}</td>
              <td>{t.price ?? "-"}</td>
              <td>{t.fees ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 24 }}>Bank</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {bankTxns.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.bankAccount.name}</td>
              <td>{t.type}</td>
              <td>{t.amount.toFixed(2)}</td>
              <td>{t.description ?? ""}</td>
              <td>{t.category ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}