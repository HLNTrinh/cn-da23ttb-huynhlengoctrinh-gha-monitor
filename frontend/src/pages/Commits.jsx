import { useEffect, useState } from 'react';
import { ErrorState, Loading } from '../components/PageState.jsx';
import RunStatus from '../components/RunStatus.jsx';
import { getCommits } from '../services/workflowApi.js';

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

export default function Commits() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getCommits(page)
      .then((result) => { if (active) setData(result); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  return (
    <>
      <section className="page-intro">
        <p className="muted">Các commit đã được ghi nhận qua GitHub Actions workflow runs.</p>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div><h2>Commits đã đồng bộ</h2><p className="muted">Mỗi commit chỉ hiển thị một lần cho mỗi repository.</p></div>
          {data && <span className="commit-total">{data.total} commits</span>}
        </div>
        {error ? <ErrorState message={error} /> : loading || !data ? <Loading /> : data.items.length === 0 ? (
          <div className="empty-state">Chưa có commit. Hãy đồng bộ workflow runs của repository trước.</div>
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
                      <a className="primary-link" href={commit.htmlUrl} target="_blank" rel="noreferrer">
                        {commit.workflow?.name || 'Workflow run'} #{commit.runNumber}
                      </a>
                      <span className="commit-status"><RunStatus run={commit} /></span>
                    </td>
                    <td>{commit.actor || '—'}</td>
                    <td>{formatDate(commit.createdAt)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="commit-pagination">
              <span className="table-summary">Trang {data.page} / {Math.max(1, data.pages)} · {data.total} commits</span>
              <div className="button-row">
                <button className="button secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Trước</button>
                <button className="button secondary" disabled={page >= data.pages || loading} onClick={() => setPage((current) => current + 1)}>Sau</button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
