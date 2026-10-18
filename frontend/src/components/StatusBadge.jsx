export default function StatusBadge({ status, conclusion }) {
  const value = conclusion || status || 'unknown';
  const label = value.replaceAll('_', ' ');
  return <span className={`badge badge-${value}`}>{label}</span>;
}
