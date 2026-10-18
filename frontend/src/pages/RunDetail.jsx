import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getRun } from '../services/workflowApi.js';

export default function RunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getRun(id).then(setRun).catch((cause) => setError(cause.message)); }, [id]);
  if (!run && !error) return <Loading />;
  if (error) return <ErrorState message={error} />;
  return <>
    <section className="detail-hero"><div><Link className="text-link" to="/runs">← Workflow runs</Link><h2>{run.name || `Run #${run.runNumber}`}</h2><p className="muted">{run.repository?.fullName} · {run.branch} · {run.commitSha?.slice(0, 8)}</p></div><a className="button secondary" href={run.htmlUrl} target="_blank" rel="noreferrer">Mở trên GitHub ↗</a></section>
    <section className="inline-stats"><span><StatusBadge status={run.status} conclusion={run.conclusion} /></span><span>Trigger <strong>{run.event}</strong></span><span>Người chạy <strong>{run.actor || '—'}</strong></span><span>Bắt đầu <strong>{run.startedAt ? new Date(run.startedAt).toLocaleString('vi-VN') : '—'}</strong></span></section>
    <section className="panel"><div className="panel-heading"><div><h2>Jobs và steps</h2><p className="muted">{run.jobs.length} jobs</p></div></div>
      {run.jobs.length ? <div className="job-list">{run.jobs.map((job) => <article className="job-card" key={job._id}><div className="job-heading"><strong>{job.name}</strong><StatusBadge status={job.status} conclusion={job.conclusion} /></div><div className="step-list">{job.steps.map((step) => <div className="step-row" key={step._id}><span className={`step-indicator step-${step.conclusion || step.status}`} /> <span>{step.number}. {step.name}</span><span className="muted">{step.completedAt ? new Date(step.completedAt).toLocaleTimeString('vi-VN') : step.status}</span></div>)}</div></article>)}</div> : <div className="empty-state">Run chưa có dữ liệu jobs.</div>}
    </section>
  </>;
}
