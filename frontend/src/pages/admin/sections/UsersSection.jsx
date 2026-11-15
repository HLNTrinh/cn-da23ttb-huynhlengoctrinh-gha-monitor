import { useState } from 'react';
import {
  addAdminUser,
  deleteAdminUser,
  updateAdminUser
} from '../../../services/adminApi.js';
import { formatExactDate, getRelativeTime } from '../adminFormat.js';
import { ellipsisStyles, rowStyles } from '../adminStyles.js';

export default function UsersSection({ users, busy, perform }) {
  // Form người dùng GitHub
  const [newLogin, setNewLogin] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [userSearch, setUserSearch] = useState('');

  // Filtered GitHub users
  const filteredUsers = users.filter((u) => {
    const term = userSearch.trim().toLowerCase();
    return (u.githubLogin || '').toLowerCase().includes(term) || (u.name || '').toLowerCase().includes(term);
  });

  return (
    <section className="panel admin-panel">
      <div className="panel-heading">
        <div>
          <h2>Quản lý người dùng GitHub OAuth</h2>
          <p className="muted">
            Cấp quyền truy cập ứng dụng giám sát CI/CD cho các tài khoản GitHub.
          </p>
        </div>
      </div>

      <form
        className="admin-inline-form-modern"
        onSubmit={(event) => {
          event.preventDefault();
          perform(async () => {
            await addAdminUser({
              githubLogin: newLogin.trim(),
              role: newRole
            });
            setNewLogin('');
          }, 'Đã thêm người dùng GitHub thành công.');
        }}
      >
        <div className="form-inline-field">
          <label>Tài khoản GitHub (Username)</label>
          <input
            value={newLogin}
            onChange={(event) => setNewLogin(event.target.value)}
            placeholder="Ví dụ: octocat..."
            required
          />
        </div>

        <div className="form-inline-field">
          <label>Vai trò hệ thống</label>
          <select value={newRole} onChange={(event) => setNewRole(event.target.value)}>
            <option value="viewer">Người xem (Viewer)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>

        <button type="submit" className="button primary button-sm" disabled={busy}>
          + Thêm người dùng
        </button>
      </form>

      {/* Search Filter for Users */}
      <div className="admin-filter-bar">
        <input
          type="search"
          className="select"
          placeholder="Tìm theo username hoặc tên người dùng..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tài khoản GitHub</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Đăng nhập lần cuối</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="admin-user-cell" style={rowStyles.userCell}>
                    <span className="github-user-icon" style={{ flexShrink: 0 }}>👤</span>
                    <div style={ellipsisStyles.box}>
                      <strong
                        style={ellipsisStyles.oneLine}
                        title={`${item.name || item.githubLogin} (@${item.githubLogin})`}
                      >
                        {item.name || item.githubLogin}
                      </strong>
                      <span className="muted text-sm" style={ellipsisStyles.oneLine}>
                        @{item.githubLogin}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    aria-label={`Vai trò của ${item.githubLogin}`}
                    className="select-role-compact"
                    value={item.role}
                    disabled={busy}
                    onChange={(event) =>
                      perform(
                        () =>
                          updateAdminUser(item._id, {
                            role: event.target.value
                          }),
                        'Đã cập nhật vai trò người dùng.'
                      )
                    }
                  >
                    <option value="viewer">Viewer (Chỉ xem)</option>
                    <option value="admin">Admin (Toàn quyền)</option>
                  </select>
                </td>
                <td>
                  <span className={`admin-state ${item.active ? 'enabled' : 'disabled'}`}>
                    {item.active ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td>
                  <div className="admin-date-cell">
                    <span>{getRelativeTime(item.lastLoginAt)}</span>
                    <small className="muted">{formatExactDate(item.lastLoginAt)}</small>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="admin-table-actions">
                    <button
                      className="button secondary button-sm"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        perform(
                          () =>
                            updateAdminUser(item._id, {
                              active: !item.active
                            }),
                          item.active ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.'
                        )
                      }
                    >
                      {item.active ? 'Khóa' : 'Mở khóa'}
                    </button>
                    <button
                      className="button danger button-sm"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Xác nhận xóa tài khoản @${item.githubLogin}?`)) {
                          perform(
                            () => deleteAdminUser(item._id),
                            'Đã xóa người dùng khỏi hệ thống.'
                          );
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!filteredUsers.length && (
              <tr>
                <td colSpan="5" className="admin-empty">
                  {userSearch ? 'Không tìm thấy người dùng phù hợp với từ khóa.' : 'Chưa có người dùng nào được cấp quyền.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}