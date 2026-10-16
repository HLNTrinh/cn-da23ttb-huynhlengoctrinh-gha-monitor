import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState.jsx';
import { getRepositories, syncAll, syncRepositories } from '../services/repositoryApi.js';

export default function Repositories() {
  const [repositories, setRepositories] = useState(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const load = () => getRepositories().then(setRepositories).catch((cause) => setError(cause.message));
  useEffect(() => { load(); }, []);
  async function sync(action) {
    setWorking(true); setError('');
    try { await action(); await load(); } catch (cause) { setError(cause.message); }
    finally { setWorking(false); }
  }
  if (!repositories && !error) return <Loading />;
  return <>
    <section className="page-actions"><div><p className="muted">Kết nối và đồng bộ repository GitHub của bạn.</p></div><div className="button-row"><button className="button secondary" disabled={working} onClick={() => sync(syncRepositories)}>Tải repositories</button><button className="button primary" disabled={working} onClick={() => sync(syncAll)}>{working ? 'Đang đồng bộ…' : 'Đồng bộ tất cả'}</button></div></section>
    {error && <ErrorState message={error} />}
    <section className="repo-grid">{repositories?.map((repo) => <article className="repo-card" key={repo._id}>
      <div className="repo-top"><span className="repo-icon">◈</span><span className={`visibility ${repo.isPrivate ? 'private' : ''}`}>{repo.isPrivate ? 'Private' : 'Public'}</span></div>
      <Link className="repo-name" to={`/repositories/${encodeURIComponent(repo.fullName)}`}>{repo.fullName}</Link>
      <p className="muted repo-description">{repo.description || 'Chưa có mô tả repository.'}</p>
      <div className="repo-foot"><span>⑂ {repo.defaultBranch}</span><span>{repo.lastSyncedAt ? `Đồng bộ ${new Date(repo.lastSyncedAt).toLocaleDateString('vi-VN')}` : 'Chưa đồng bộ'}</span></div>
    </article>)}</section>
    {repositories?.length === 0 && <div className="empty-state">Chưa có repository. Nhấn “Tải repositories” để kết nối GitHub.</div>}
  </>;
}
