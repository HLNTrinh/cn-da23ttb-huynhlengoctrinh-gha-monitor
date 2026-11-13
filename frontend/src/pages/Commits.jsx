import { Fragment, useEffect, useState } from 'react';
import { ErrorState, Loading } from '../components/PageState.jsx';
import RunStatus from '../components/RunStatus.jsx';
import { getCommits, syncCommits } from '../services/workflowApi.js';
import { getRepositories } from '../services/repositoryApi.js';
import { useAuth } from '../auth/AuthContext.jsx';

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

export default function Commits() {
  const { session } = useAuth();
  const isAdmin = session?.user?.role === 'admin';
  const [page, setPage] = useState(1);
  const [selectedRepository, setSelectedRepository] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [expandedCommit, setExpandedCommit] = useState(null);

  useEffect(() => {
    getRepositories()
      .then(setRepositories)
      .catch((cause) => setError(cause.message));
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setData(await getCommits(page, 25, selectedRepository));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, selectedRepository]);

  async function handleSync() {
    setSyncing(true);
    setError('');
    try {
      const targets = selectedRepository
        ? [selectedRepository]
        : repositories.map((repo) => repo.fullName);
      for (const repository of targets) {
        await syncCommits(repository);
      }
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
        <p className="muted">Lịch sử commit trên nhánh mặc định của các repository đã kết nối.</p>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Tổng hợp commits</h2>
            <p className="muted">{selectedRepository || 'Tất cả repository'} · lịch sử trên nhánh mặc định</p>
          </div>
          <div className="button-row">
            {data && <span className="commit-total">{data.total} commits</span>}
            {isAdmin && <button className="button primary" disabled={syncing || loading || repositories.length === 0} onClick={handleSync}>{syncing ? 'Đang đồng bộ…' : selectedRepository ? 'Đồng bộ commits' : 'Đồng bộ tất cả commits'}</button>}
          </div>
        </div>
        <div className="commit-filter">
          <label htmlFor="commit-repository">Lọc theo repository</label>
          <select
            id="commit-repository"
            className="select"
            value={selectedRepository}
            onChange={(event) => {
              setPage(1);
              setSelectedRepository(event.target.value);
            }}
          >
            <option value="">Tất cả repository</option>
            {repositories.map((repo) => (
              <option key={repo._id} value={repo.fullName}>{repo.fullName}</option>
            ))}
          </select>
        </div>
        {error ? <ErrorState message={error} /> : loading || !data ? <Loading /> : data.items.length === 0 ? (
          <div className="empty-state">Chưa có commit. Nhấn nút đồng bộ để lấy lịch sử từ GitHub.</div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead><tr><th>SHA / Nội dung</th><th>Repository</th><th>Nhánh</th><th>Workflow gần nhất</th><th>Tác giả</th><th>Thời gian</th></tr></thead>
                <tbody>{data.items.map((commit) => {
                  const isExpanded = expandedCommit === commit._id;
                  const detailsId = `commit-details-${commit._id}`;
                  return (
                    <Fragment key={`${commit.repository._id}-${commit.sha}`}>
                      <tr>
                        <td>
                          <button
                            className="commit-expand-button"
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={detailsId}
                            onClick={() => setExpandedCommit(isExpanded ? null : commit._id)}
                          >
                            <span className="commit-sha">{commit.sha.slice(0, 7)}</span>
                            <span>{isExpanded ? 'Ẩn nội dung' : 'Xem nội dung'}</span>
                          </button>
                        </td>
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
                      {isExpanded && (
                        <tr className="commit-details-row" key={`${commit.repository._id}-${commit.sha}-details`}>
                          <td id={detailsId} colSpan="6">
                            <div className="commit-details">
                              <strong>Nội dung commit</strong>
                              <p>{commit.message || 'Commit này không có nội dung mô tả.'}</p>
                              <a className="primary-link" href={commit.htmlUrl || `https://github.com/${commit.repository.fullName}/commit/${commit.sha}`} target="_blank" rel="noreferrer">
                                Xem commit trên GitHub
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}</tbody>
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
