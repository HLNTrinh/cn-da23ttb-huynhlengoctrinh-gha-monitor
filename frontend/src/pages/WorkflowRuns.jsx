import { useState } from 'react';
import { ErrorState, Loading } from '../components/PageState.jsx';
import WorkflowTable from '../components/WorkflowTable.jsx';
import useWorkflowRuns from '../hooks/useWorkflowRuns.js';

export default function WorkflowRuns() {
  const [status, setStatus] = useState('');
  const query = status ? `status=${encodeURIComponent(status)}&limit=50` : 'limit=50';
  const { data, loading, error } = useWorkflowRuns(query);
  return <section className="panel"><div className="panel-heading"><div><h2>Tất cả workflow runs</h2><p className="muted">Lọc theo trạng thái thực thi.</p></div><select className="select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả trạng thái</option><option value="completed">Hoàn tất</option><option value="in_progress">Đang chạy</option><option value="queued">Đang chờ</option></select></div>
    {error ? <ErrorState message={error} /> : loading || !data ? <Loading /> : <><WorkflowTable runs={data.items} /><p className="table-summary">Hiển thị {data.items.length} / {data.total} lần chạy</p></>}
  </section>;
}
