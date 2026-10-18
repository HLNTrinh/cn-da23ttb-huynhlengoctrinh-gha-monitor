import { Link } from 'react-router-dom';
import RunStatus from './RunStatus.jsx';

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

export default function WorkflowTable({ runs = [] }) {
  if (!runs.length) return <div className="empty-state">Chưa có workflow run. Hãy đồng bộ repository với GitHub.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Workflow</th><th>Repository</th><th>Branch</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
        <tbody>{runs.map((run) => (
          <tr key={run._id}>
            <td><Link to={`/runs/${run._id}`} className="primary-link">{run.name || run.workflow?.name || `Run #${run.runNumber}`}</Link><span className="muted block">#{run.runNumber} · {run.event}</span></td>
            <td>{run.repository?.fullName ?? '—'}</td>
            <td><code>{run.branch || '—'}</code></td>
            <td><RunStatus run={run} /></td>
            <td>{formatDate(run.createdAt)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
