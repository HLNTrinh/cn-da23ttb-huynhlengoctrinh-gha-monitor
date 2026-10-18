export default function StatisticCard({ label, value, detail, tone = 'blue' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value ?? '—'}</strong>
      {detail && <span className="stat-detail">{detail}</span>}
    </article>
  );
}
