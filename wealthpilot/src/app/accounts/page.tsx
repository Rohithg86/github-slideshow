import { prisma } from "@/lib/prisma";

export default async function AccountsPage() {
  const [brokerAccounts, bankAccounts] = await Promise.all([
    prisma.brokerAccount.findMany({ include: { holdings: true } }),
    prisma.bankAccount.findMany({ include: { transactions: true } }),
  ]);

  return (
    <div>
      <h2>Accounts</h2>
      <h3>Broker Accounts</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Broker</th>
            <th>Account Number</th>
            <th>Positions</th>
          </tr>
        </thead>
        <tbody>
          {brokerAccounts.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.broker}</td>
              <td>{a.accountNumber}</td>
              <td>{a.holdings.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 24 }}>Bank Accounts</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Institution</th>
            <th>Account Number</th>
            <th>Balance</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {bankAccounts.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.institution}</td>
              <td>{a.accountNumber}</td>
              <td>{a.balance.toFixed(2)}</td>
              <td>{a.transactions.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}