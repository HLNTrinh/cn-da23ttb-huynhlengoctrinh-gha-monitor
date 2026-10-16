import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState.jsx';
import { getWorkflows } from '../services/workflowApi.js';

export default function Workflows() {
  const [workflows, setWorkflows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getWorkflows().then(setWorkflows).catch((cause) => setError(cause.message)); }, []);
  if (!workflows && !error) return <Loading />;
  if (error) return <ErrorState message={error} />;
  return <section className="panel"><div className="panel-heading"><div><h2>Tất cả workflows</h2><p className="muted">{workflows.length} workflow đã được phát hiện</p></div></div>
    {workflows.length ? <div className="workflow-list">{workflows.map((workflow) => <Link key={workflow._id} to={`/workflows/${workflow._id}`}><span className="workflow-name">{workflow.name}</span><span className="muted">{workflow.repository?.fullName}</span><code>{workflow.path}</code><span className={`badge badge-${workflow.state}`}>{workflow.state}</span></Link>)}</div> : <div className="empty-state">Chưa có workflow. Hãy đồng bộ repository từ GitHub.</div>}
  </section>;
}
