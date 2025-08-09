async function fetchRecs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/recommendations`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

export default async function RecommendationsPage() {
  const data = await fetchRecs();
  const recs = data.recommendations as Array<any>;
  return (
    <div>
      <h2>Recommendations</h2>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Symbol</th>
            <th>Score</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {recs.map((r: any, idx: number) => (
            <tr key={idx}>
              <td>{r.action}</td>
              <td>{r.symbol ?? "-"}</td>
              <td>{(r.score * 100).toFixed(0)}%</td>
              <td>{r.rationale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}