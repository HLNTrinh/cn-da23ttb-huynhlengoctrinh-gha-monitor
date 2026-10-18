import { useEffect, useState } from 'react';
import { ErrorState, Loading } from '../components/PageState.jsx';
import RunStatus from '../components/RunStatus.jsx';
import { getCommits, syncCommits } from '../services/workflowApi.js';

const repository = 'HLNTrinh/cn-da23ttb-huynhlengoctrinh-gha-monitor';

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

export default function Commits() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setData(await getCommits(1, 1, repository));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSync() {
    setSyncing(true);
    setError('');
    try {
      await syncCommits(repository);
      await load();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
      <section className="page-intro">
        <p className="muted">Lịch sử commit của {repository} trên nhánh mặc định.</p>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div><h2>Commit mới nhất</h2><p className="muted">{repository}</p></div>
          <div className="button-row">
            {data && <span className="commit-total">{data.total ? 'Commit mới nhất' : 'Chưa có commit'}</span>}
            <button className="button primary" disabled={syncing || loading} onClick={handleSync}>{syncing ? 'Đang đồng bộ…' : 'Đồng bộ commits'}</button>
          </div>
        </div>
        {error ? <ErrorState message={error} /> : loading || !data ? <Loading /> : data.items.length === 0 ? (
          <div className="empty-state">Chưa có commit. Nhấn “Đồng bộ commits” để lấy commit mới nhất từ GitHub.</div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Commit</th><th>Repository</th><th>Nhánh</th><th>Workflow gần nhất</th><th>Tác giả</th><th>Thời gian</th></tr></thead>
                <tbody>{data.items.map((commit) => (
                  <tr key={`${commit.repository._id}-${commit.sha}`}>
                    <td><a className="commit-sha" href={`https://github.com/${commit.repository.fullName}/commit/${commit.sha}`} target="_blank" rel="noreferrer">{commit.sha.slice(0, 7)}</a></td>
                    <td>{commit.repository.fullName}</td>
                    <td><code>{commit.branch || '—'}</code></td>
                    <td>
                      {commit.runHtmlUrl ? <>
                        <a className="primary-link" href={commit.runHtmlUrl} target="_blank" rel="noreferrer">
                          {commit.workflow?.name || 'Workflow run'} #{commit.runNumber}
                        </a>
                        <span className="commit-status"><RunStatus run={commit} /></span>
                      </> : <span className="muted">Chưa chạy workflow</span>}
                    </td>
                    <td>{commit.actor || '—'}</td>
                    <td>{formatDate(commit.createdAt)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}
