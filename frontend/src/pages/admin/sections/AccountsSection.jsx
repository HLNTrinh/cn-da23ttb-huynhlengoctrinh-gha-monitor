import { useState } from 'react';
import {
  addAdminAccount,
  changeAdminPassword,
  updateAdminAccount
} from '../../../services/adminApi.js';
import { formatExactDate, getRelativeTime } from '../adminFormat.js';
import { ellipsisStyles, rowStyles } from '../adminStyles.js';

export default function AccountsSection({ user, accounts, busy, perform }) {
  // Form tài khoản Admin
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  return (
    <section className="admin-two-column">
      <section className="panel admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Tài khoản Quản trị viên</h2>
            <p className="muted">
              Đăng nhập qua cổng Admin Portal bằng email và mật khẩu độc lập với GitHub.
            </p>
          </div>
        </div>

        <form
          className="admin-form-block"
          onSubmit={(event) => {
            event.preventDefault();
            perform(async () => {
              await addAdminAccount({
                email: newAdminEmail.trim(),
                password: newAdminPassword
              });
              setNewAdminEmail('');
              setNewAdminPassword('');
            }, 'Đã tạo tài khoản Quản trị mới thành công.');
          }}
        >
          <h4 className="form-subheading">Tạo tài khoản Quản trị mới</h4>
          <div className="form-grid-2">
            <label>
              Email đăng nhập
              <input
                type="email"
                autoComplete="off"
                value={newAdminEmail}
                onChange={(event) => setNewAdminEmail(event.target.value)}
                placeholder="admin@domain.com"
                required
              />
            </label>

            <label>
              Mật khẩu khởi tạo (tối thiểu 14 ký tự)
              <input
                type="password"
                autoComplete="new-password"
                minLength={14}
                value={newAdminPassword}
                onChange={(event) => setNewAdminPassword(event.target.value)}
                placeholder="Nhập ít nhất 14 ký tự..."
                required
              />
            </label>
          </div>

          <button type="submit" className="button primary button-sm" disabled={busy}>
            + Thêm tài khoản Quản trị
          </button>
        </form>

        <div className="admin-list-container">
          <h4 className="form-subheading" style={{ padding: '16px 20px 8px' }}>Danh sách tài khoản hiện tại</h4>
          <div className="admin-list">
            {accounts.map((account) => (
              <div className="admin-list-row" style={rowStyles.row} key={account._id}>
                <div className="admin-row-user" style={rowStyles.left}>
                  <div className="admin-avatar-small" style={{ flexShrink: 0 }}>
                    {(account.email?.[0] || 'A').toUpperCase()}
                  </div>
                  <div style={ellipsisStyles.box}>
                    <strong style={ellipsisStyles.oneLine} title={account.email}>
                      {account.email}
                    </strong>
                    <span className="muted text-sm" style={ellipsisStyles.oneLine}>
                      {account.lastLoginAt
                        ? `Đăng nhập lần cuối: ${getRelativeTime(account.lastLoginAt)} (${formatExactDate(account.lastLoginAt)})`
                        : 'Chưa từng đăng nhập'}
                    </span>
                  </div>
                </div>

                <div className="admin-table-actions" style={rowStyles.actions}>
                  <span className={`admin-state ${account.active ? 'enabled' : 'disabled'}`}>
                    {account.active ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                  <button
                    className={`button button-sm ${account.active ? 'secondary' : 'primary'}`}
                    type="button"
                    disabled={
                      busy ||
                      account.email === user?.email ||
                      (account.active && accounts.filter((item) => item.active).length <= 1)
                    }
                    onClick={() =>
                      perform(
                        () =>
                          updateAdminAccount(account._id, {
                            active: !account.active
                          }),
                        account.active
                          ? 'Đã khóa tài khoản Quản trị.'
                          : 'Đã mở khóa tài khoản Quản trị.'
                      )
                    }
                  >
                    {account.active ? 'Khóa tài khoản' : 'Mở khóa'}
                  </button>
                </div>
              </div>
            ))}

            {!accounts.length && (
              <p className="admin-empty">Chưa có tài khoản Quản trị nào trong hệ thống.</p>
            )}
          </div>
        </div>
      </section>

      {/* Form đổi mật khẩu */}
      <section className="panel admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Đổi mật khẩu tài khoản hiện tại</h2>
            <p className="muted">
              Đang thao tác với tài khoản: <strong>{user?.email}</strong>
            </p>
          </div>
        </div>

        <form
          className="admin-form-block"
          onSubmit={(event) => {
            event.preventDefault();
            perform(async () => {
              await changeAdminPassword(passwordForm);
              setPasswordForm({
                currentPassword: '',
                newPassword: ''
              });
            }, 'Đã cập nhật mật khẩu mới thành công.');
          }}
        >
          <div className="form-stack">
            <label>
              Mật khẩu hiện tại
              <input
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: event.target.value
                  })
                }
                placeholder="Nhập mật khẩu hiện tại..."
                required
              />
            </label>

            <label>
              Mật khẩu mới (tối thiểu 14 ký tự)
              <input
                type="password"
                autoComplete="new-password"
                minLength={14}
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: event.target.value
                  })
                }
                placeholder="Nhập mật khẩu mới..."
                required
              />
            </label>
          </div>

          <button type="submit" className="button primary button-sm" disabled={busy}>
            Cập nhật mật khẩu
          </button>
        </form>
      </section>
    </section>
  );
}