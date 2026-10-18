import StatusBadge from './StatusBadge.jsx';

export default function RunStatus({ run }) {
  return <StatusBadge status={run.status} conclusion={run.conclusion} />;
}
