import { useState } from 'react';
import { formatAction, formatExactDate, getRelativeTime } from '../adminFormat.js';
import { ellipsisStyles, rowStyles } from '../adminStyles.js';

export default function ActivitySection({ activity }) {
  const [activitySearch, setActivitySearch] = useState('');

  // Filtered Activity
  const filteredActivity = activity.filter((act) => {
    const term = activitySearch.trim().toLowerCase();
    return (
      (act.action || '').toLowerCase().includes(term) ||
      (act.actorLogin || '').toLowerCase().includes(term) ||
      (act.target || '').toLowerCase().includes(term)
    );
  });

  return (
    <section className="panel admin-panel">
      <div className="panel-heading">
        <div>
          <h2>Nhật ký hoạt động hệ thống</h2>
          <p className="muted">
            Toàn bộ thao tác cấu hình, đăng nhập và phân quyền được ghi nhận minh bạch.
          </p>
        </div>
      </div>

      <div className="admin-filter-bar">
        <input
          type="search"
          className="select"
          placeholder="Tìm kiếm thao tác, người thực hiện..."
          value={activitySearch}
          onChange={(e) => setActivitySearch(e.target.value)}
        />
      </div>

      <div className="admin-list">
        {filteredActivity.map((entry) => (
          <div className="admin-list-row activity-row" style={rowStyles.row} key={entry._id}>
            <div className="activity-main" style={rowStyles.left}>
              <div className="activity-badge-pill" style={{ flexShrink: 0 }}>
                {formatAction(entry.action)}
              </div>
              <div className="activity-details" style={ellipsisStyles.box}>
                <span
                  style={ellipsisStyles.oneLine}
                  title={`Người thực hiện: ${entry.actorLogin}${entry.target ? ` · Đối tượng: ${entry.target}` : ''}`}
                >
                  Người thực hiện: <strong>{entry.actorLogin}</strong>
                  {entry.target ? ` · Đối tượng: ${entry.target}` : ''}
                </span>
              </div>
            </div>

            <div className="activity-time-col" style={rowStyles.actions}>
              <span className="activity-relative-time">{getRelativeTime(entry.createdAt)}</span>
              <small className="muted text-xs">{formatExactDate(entry.createdAt)}</small>
            </div>
          </div>
        ))}

        {!filteredActivity.length && (
          <p className="admin-empty">
            {activitySearch ? 'Không tìm thấy hoạt động phù hợp.' : 'Chưa có hoạt động nào được ghi nhận.'}
          </p>
        )}
      </div>
    </section>
  );
}