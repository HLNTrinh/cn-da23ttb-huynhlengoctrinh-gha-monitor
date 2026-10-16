import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState.jsx';
import WorkflowTable from '../components/WorkflowTable.jsx';
import { getRuns, getWorkflow } from '../services/workflowApi.js';

export default function WorkflowDetail() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([getWorkflow(id), getRuns(`workflow=${id}&limit=25`)]).then(([details, runData]) => {
      setWorkflow(details); setRuns(runData.items);
    }).catch((cause) => setError(cause.message));
  }, [id]);
  if (!workflow && !error) return <Loading />;
  if (error) return <ErrorState message={error} />;
  return <>
    <section className="detail-hero"><div><Link className="text-link" to="/workflows">← Workflows</Link><h2>{workflow.name}</h2><p className="muted">{workflow.repository?.fullName} · {workflow.path}</p></div><a className="button secondary" href={workflow.htmlUrl} target="_blank" rel="noreferrer">GitHub ↗</a></section>
    <section className="panel"><div className="panel-heading"><div><h2>Workflow runs</h2><p className="muted">Các lần chạy gần đây của workflow này</p></div></div><WorkflowTable runs={runs} /></section>
  </>;
}
