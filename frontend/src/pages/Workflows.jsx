import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState.jsx';
import { syncAll } from '../services/repositoryApi.js';
import { getWorkflows } from '../services/workflowApi.js';

export default function Workflows() {
  const [workflows, setWorkflows] = useState(null);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  async function load() {
    setWorkflows(await getWorkflows());
  }
  useEffect(() => { load().catch((cause) => setError(cause.message)); }, []);
  async function handleSync() {
    setSyncing(true);
    setError('');
    try {
      await syncAll();
      await load();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSyncing(false);
    }
  }
  if (!workflows && !error) return <Loading />;
  return <>
    {error && <ErrorState message={error} />}
    <section className="panel"><div className="panel-heading"><div><h2>Tất cả workflows</h2><p className="muted">{workflows?.length ?? 0} workflow đã được phát hiện</p></div><button className="button primary" disabled={syncing} onClick={handleSync}>{syncing ? 'Đang đồng bộ…' : 'Đồng bộ workflows'}</button></div>
      {workflows?.length ? <div className="workflow-list">{workflows.map((workflow) => <Link key={workflow._id} to={`/workflows/${workflow._id}`}><span className="workflow-name">{workflow.name}</span><span className="muted">{workflow.repository?.fullName}</span><code>{workflow.path}</code><span className={`badge badge-${workflow.state}`}>{workflow.state}</span></Link>)}</div> : <div className="empty-state">Chưa có workflow. Hãy đồng bộ repository từ GitHub.</div>}
    </section>
  </>;
}
