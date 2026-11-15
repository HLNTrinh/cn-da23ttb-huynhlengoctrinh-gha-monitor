import { useState } from 'react';
import {
  setRepositoryMonitoring,
  syncAllAdminRepositories
} from '../../../services/adminApi.js';
import { formatExactDate, getRelativeTime } from '../adminFormat.js';
import { ellipsisStyles, rowStyles } from '../adminStyles.js';

export default function RepositoriesSection({ repositories, busy, perform }) {
  const [repoSearch, setRepoSearch] = useState('');

  // Filtered repositories
  const filteredRepositories = repositories.filter((r) =>
    (r.fullName || '').toLowerCase().includes(repoSearch.trim().toLowerCase())
  );

  return (
    <section className="panel admin-panel">
      <div className="panel-heading">
        <div>
          <h2>Kho lưu trữ được giám sát</h2>
          <p className="muted">
            Bật hoặc tắt chức năng tự động theo dõi và bắt webhook cho từng kho lưu trữ.
          </p>
        </div>
        <div className="panel-heading-actions">
          <button
            type="button"
            className="button primary button-sm"
            disabled={busy}
            onClick={() =>
              perform(
                syncAllAdminRepositories,
                'Đã đồng bộ toàn bộ kho lưu trữ từ GitHub.'
              )
            }
          >
            Đồng bộ danh sách
          </button>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          type="search"
          className="select"
          placeholder="Tìm kiếm theo tên kho lưu trữ..."
          value={repoSearch}
          onChange={(e) => setRepoSearch(e.target.value)}
        />
      </div>

      <div className="admin-list">
        {filteredRepositories.map((repository) => (
          <div className="admin-list-row" style={rowStyles.row} key={repository._id}>
            <div className="admin-repo-row" style={ellipsisStyles.box}>
              <div style={ellipsisStyles.box}>
                <strong style={ellipsisStyles.oneLine} title={repository.fullName}>
                  {repository.fullName}
                </strong>
                <div className="repo-sub-meta" style={ellipsisStyles.oneLine}>
                  <span>Nhánh mặc định: <code>{repository.defaultBranch || 'main'}</code></span>
                  <span className="dot-sep"> · </span>
                  <span className="muted">
                    {repository.lastSyncedAt
                      ? `Đồng bộ lần cuối: ${getRelativeTime(repository.lastSyncedAt)} (${formatExactDate(repository.lastSyncedAt)})`
                      : 'Chưa từng đồng bộ'}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-table-actions" style={rowStyles.actions}>
              <span className={`admin-state ${repository.monitoringEnabled !== false ? 'enabled' : 'disabled'}`}>
                {repository.monitoringEnabled !== false ? 'Đang theo dõi' : 'Tạm dừng'}
              </span>
              <button
                className={`button button-sm ${
                  repository.monitoringEnabled !== false ? 'secondary' : 'primary'
                }`}
                type="button"
                disabled={busy}
                onClick={() =>
                  perform(
                    () =>
                      setRepositoryMonitoring(
                        repository._id,
                        repository.monitoringEnabled === false
                      ),
                    repository.monitoringEnabled !== false
                      ? 'Đã tắt giám sát kho lưu trữ.'
                      : 'Đã bật giám sát kho lưu trữ.'
                  )
                }
              >
                {repository.monitoringEnabled !== false ? 'Dừng theo dõi' : 'Bật theo dõi'}
              </button>
            </div>
          </div>
        ))}

        {!filteredRepositories.length && (
          <p className="admin-empty">
            {repoSearch ? 'Không tìm thấy kho lưu trữ phù hợp.' : 'Chưa có kho lưu trữ nào.'}
          </p>
        )}
      </div>
    </section>
  );
}