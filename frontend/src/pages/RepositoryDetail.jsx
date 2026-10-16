import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState.jsx';
import WorkflowTable from '../components/WorkflowTable.jsx';
import { getRepository, syncRepository } from '../services/repositoryApi.js';
import { getRuns, getWorkflows } from '../services/workflowApi.js';

export default function RepositoryDetail() {
  const { fullName } = useParams();
  const [data, setData] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  async function load() {
    const repo = await getRepository(fullName);
    const [workflowData, runData] = await Promise.all([getWorkflows(repo._id), getRuns(`repository=${repo._id}&limit=10`)]);
    setData(repo); setWorkflows(workflowData); setRuns(runData.items);
  }
  useEffect(() => { load().catch((cause) => setError(cause.message)); }, [fullName]);
  async function refresh() {
    setWorking(true); setError('');
    try { await syncRepository(fullName); await load(); }
    catch (cause) { setError(cause.message); }
    finally { setWorking(false); }
  }
  if (!data && !error) return <Loading />;
  if (error && !data) return <ErrorState message={error} />;
  return <>
    <section className="detail-hero"><div><Link className="text-link" to="/repositories">← Repositories</Link><h2>{data.fullName}</h2><p className="muted">{data.description || 'Không có mô tả'}</p></div><button className="button primary" disabled={working} onClick={refresh}>{working ? 'Đang đồng bộ…' : 'Đồng bộ'}</button></section>
    {error && <ErrorState message={error} />}
    <div className="inline-stats"><span><strong>{workflows.length}</strong> workflows</span><span><strong>{data.runCount}</strong> runs</span><a href={data.htmlUrl} target="_blank" rel="noreferrer">Mở trên GitHub ↗</a></div>
    <section className="panel"><div className="panel-heading"><div><h2>Workflows</h2></div></div>{workflows.length ? <div className="workflow-list">{workflows.map((workflow) => <Link key={workflow._id} to={`/workflows/${workflow._id}`}><span>{workflow.name}</span><code>{workflow.path}</code><span className="badge badge-success">{workflow.state}</span></Link>)}</div> : <div className="empty-state">Chưa có workflow được ghi nhận.</div>}</section>
    <section className="panel"><div className="panel-heading"><div><h2>Lần chạy gần đây</h2></div></div><WorkflowTable runs={runs} /></section>
  </>;
}
