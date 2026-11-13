
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorState, Loading } from '../components/PageState.jsx';

import {
  addAdminAccount,
  addAdminUser,
  addAlertRule,
  changeAdminPassword,
  deleteAdminUser,
  deleteAlertRule,
  getActivityLog,
  getAdminAccounts,
  getAdminOverview,
  getAdminUsers,
  getAlertHistory,
  getAlertRules,
  getManagedRepositories,
  markAlertRead,
  syncAllAdminRepositories,
  setRepositoryMonitoring,
  updateAdminAccount,
  updateAdminUser,
  updateAlertRule
} from '../services/adminApi.js';

// Format ngày giờ
function formatDate(value) {
  if (!value) return 'Chưa đăng nhập';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định';
  }

  return date.toLocaleString('vi-VN');
}

// Component hiển thị thống kê
function Metric({ label, value, tone = 'blue' }) {
  return (
    <div className={`admin-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

export default function Admin({ user, activeSection }) {
  // ==============================
  // STATE
  // ==============================

  const [overview, setOverview] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [repositories, setRepositories] = useState([]);

  const [ruleData, setRuleData] = useState({
    rules: [],
    repositories: []
  });

  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Ngăn gửi nhiều request cùng lúc
  const busyRef = useRef(false);
  const mountedRef = useRef(false);

  // Form người dùng GitHub
  const [newLogin, setNewLogin] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  // Form tài khoản Admin
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // Form quy tắc cảnh báo
  const [ruleForm, setRuleForm] = useState({
    name: '',
    triggerOn: 'failure',
    repository: '',
    branch: ''
  });

  // ==============================
  // LOAD ADMIN DATA
  // ==============================

  const loadAdminData = useCallback(async () => {
    const [
      overviewData,
      accountData,
      userData,
      repositoryData,
      rulesData,
      notificationData,
      activityData
    ] = await Promise.all([
      getAdminOverview(),
      getAdminAccounts(),
      getAdminUsers(),
      getManagedRepositories(),
      getAlertRules(),
      getAlertHistory(),
      getActivityLog()
    ]);

    if (!mountedRef.current) return;

    setOverview(overviewData);
    setAccounts(accountData);
    setUsers(userData);
    setRepositories(repositoryData);

    setRuleData(rulesData);

    setNotifications(notificationData?.items ?? []);
    setActivity(activityData?.items ?? []);
  }, []);

  // ==============================
  // INITIAL LOAD + AUTO REFRESH
  // ==============================

  useEffect(() => {
    let active = true;
    let polling = false;

    mountedRef.current = true;

    async function initialize() {
      try {
        await loadAdminData();
      } catch (cause) {
        if (active) {
          setError(cause.message || 'Không thể tải dữ liệu quản trị.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialize();

    // Tự động cập nhật lịch sử cảnh báo mỗi 15 giây
    const timer = window.setInterval(async () => {
      if (!active || polling) return;

      polling = true;

      try {
        const result = await getAlertHistory();

        if (active) {
          setNotifications(result?.items ?? []);
        }
      } catch (cause) {
        if (active) {
          setError(
            cause.message || 'Không thể cập nhật lịch sử cảnh báo.'
          );
        }
      } finally {
        polling = false;
      }
    }, 15000);

    return () => {
      active = false;
      mountedRef.current = false;

      window.clearInterval(timer);
    };
  }, [loadAdminData]);

  // ==============================
  // HANDLE API ACTION
  // ==============================

  const perform = useCallback(async (action, successMessage) => {
    // Không cho phép thực hiện nhiều thao tác cùng lúc
    if (busyRef.current) return;

    busyRef.current = true;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await action();

      // Tải lại dữ liệu sau khi thao tác thành công
      await loadAdminData();

      if (mountedRef.current) {
        setMessage(successMessage);
      }
    } catch (cause) {
      if (mountedRef.current) {
        setError(
          cause.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
        );
      }
    } finally {
      busyRef.current = false;

      if (mountedRef.current) {
        setBusy(false);
      }
    }
  }, [loadAdminData]);

  // ==============================
  // LOADING / ERROR
  // ==============================

  if (loading) {
    return <Loading />;
  }

  if (error && !overview) {
    return <ErrorState message={error} />;
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="admin-page">

      {/* Thông báo */}
      {error && (
        <div className="notice error-notice" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="notice admin-success" role="status">
          {message}
        </div>
      )}

      {/* =================================
          1. OVERVIEW
      ================================= */}

      {activeSection === 'overview' && (
        <>
          <section className="admin-welcome">
            <div>
              <p className="eyebrow">ADMINISTRATION</p>

              <h2>Trung tâm quản trị</h2>

              <p className="muted">
                Xin chào {user?.email || 'Admin'}.
                Quản lý hệ thống từ thanh điều hướng.
              </p>
            </div>

            <button
              type="button"
              className="button primary"
              disabled={busy}
              onClick={() =>
                perform(
                  syncAllAdminRepositories,
                  'Đã đồng bộ dữ liệu từ GitHub.'
                )
              }
            >
              {busy ? 'Đang xử lý...' : 'Đồng bộ tất cả'}
            </button>
          </section>

          <section className="admin-metrics">
            <Metric
              label="Người dùng đang hoạt động"
              value={overview?.users ?? 0}
            />

            <Metric
              label="Repositories theo dõi"
              value={overview?.repositories ?? 0}
              tone="green"
            />

            <Metric
              label="Quy tắc cảnh báo"
              value={overview?.alerts ?? 0}
              tone="purple"
            />

            <Metric
              label="Cảnh báo chưa xem"
              value={overview?.unreadAlerts ?? 0}
              tone="red"
            />
          </section>
        </>
      )}

      {/* =================================
          2. ADMIN ACCOUNTS
      ================================= */}

      {activeSection === 'accounts' && (
        <section className="admin-two-column">

          {/* Danh sách tài khoản Admin */}
          <section className="panel admin-panel">

            <div className="panel-heading">
              <div>
                <h2>Tài khoản Admin riêng</h2>

                <p className="muted">
                  Đăng nhập bằng email và mật khẩu,
                  tách biệt khỏi GitHub OAuth.
                </p>
              </div>
            </div>

            <form
              className="admin-inline-form"
              onSubmit={(event) => {
                event.preventDefault();

                perform(async () => {
                  await addAdminAccount({
                    email: newAdminEmail.trim(),
                    password: newAdminPassword
                  });

                  setNewAdminEmail('');
                  setNewAdminPassword('');
                }, 'Đã tạo tài khoản Admin riêng.');
              }}
            >
              <label>
                Email

                <input
                  type="email"
                  autoComplete="off"
                  value={newAdminEmail}
                  onChange={(event) =>
                    setNewAdminEmail(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Mật khẩu tạm thời (tối thiểu 14 ký tự)

                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={14}
                  value={newAdminPassword}
                  onChange={(event) =>
                    setNewAdminPassword(event.target.value)
                  }
                  required
                />
              </label>

              <button
                type="submit"
                className="button primary button-sm"
                disabled={busy}
              >
                Tạo Admin
              </button>
            </form>

            <div className="admin-list">
              {accounts.map((account) => (
                <div className="admin-list-row" key={account._id}>

                  <div>
                    <strong>{account.email}</strong>

                    <span>
                      {account.lastLoginAt
                        ? `Đăng nhập: ${formatDate(account.lastLoginAt)}`
                        : 'Chưa đăng nhập'}
                    </span>
                  </div>

                  <button
                    className={`button button-sm ${
                      account.active ? 'secondary' : 'primary'
                    }`}
                    type="button"
                    disabled={
                      busy ||
                      account.email === user?.email ||
                      (
                        account.active &&
                        accounts.filter((item) => item.active).length <= 1
                      )
                    }
                    onClick={() =>
                      perform(
                        () =>
                          updateAdminAccount(account._id, {
                            active: !account.active
                          }),
                        account.active
                          ? 'Đã khóa tài khoản Admin.'
                          : 'Đã mở khóa tài khoản Admin.'
                      )
                    }
                  >
                    {account.active ? 'Khóa tài khoản' : 'Mở khóa'}
                  </button>

                </div>
              ))}

              {!accounts.length && (
                <p className="admin-empty">
                  Chưa có tài khoản Admin.
                </p>
              )}
            </div>
          </section>

          {/* Đổi mật khẩu */}
          <section className="panel admin-panel">

            <div className="panel-heading">
              <div>
                <h2>Đổi mật khẩu Admin</h2>

                <p className="muted">
                  Mật khẩu mới cần ít nhất 14 ký tự.
                </p>
              </div>
            </div>

            <form
              className="admin-rule-form"
              onSubmit={(event) => {
                event.preventDefault();

                perform(async () => {
                  await changeAdminPassword(passwordForm);

                  setPasswordForm({
                    currentPassword: '',
                    newPassword: ''
                  });
                }, 'Đã đổi mật khẩu.');
              }}
            >
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
                  required
                />
              </label>

              <label>
                Mật khẩu mới

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
                  required
                />
              </label>

              <button
                type="submit"
                className="button primary button-sm"
                disabled={busy}
              >
                Đổi mật khẩu
              </button>
            </form>

          </section>
        </section>
      )}

      {/* =================================
          3. GITHUB USERS
      ================================= */}

      {activeSection === 'users' && (
        <section className="panel admin-panel">

          <div className="panel-heading">
            <div>
              <h2>Quản lý người dùng GitHub</h2>

              <p className="muted">
                Cấp quyền truy cập ứng dụng thông qua GitHub OAuth.
                Đây không phải tài khoản đăng nhập Admin Portal.
              </p>
            </div>
          </div>

          <form
            className="admin-inline-form"
            onSubmit={(event) => {
              event.preventDefault();

              perform(async () => {
                await addAdminUser({
                  githubLogin: newLogin.trim(),
                  role: newRole
                });

                setNewLogin('');
              }, 'Đã thêm người dùng.');
            }}
          >
            <label>
              GitHub username

              <input
                value={newLogin}
                onChange={(event) => setNewLogin(event.target.value)}
                placeholder="github-username"
                required
              />
            </label>

            <label>
              Vai trò

              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value)}
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button
              type="submit"
              className="button primary button-sm"
              disabled={busy}
            >
              Thêm người dùng
            </button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tài khoản GitHub</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Lần đăng nhập cuối</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>

                    <td>
                      {item.name || item.githubLogin}

                      <span className="muted">
                        {' '}@{item.githubLogin}
                      </span>
                    </td>

                    <td>
                      <select
                        aria-label={`Vai trò của ${item.githubLogin}`}
                        value={item.role}
                        disabled={busy}
                        onChange={(event) =>
                          perform(
                            () =>
                              updateAdminUser(item._id, {
                                role: event.target.value
                              }),
                            'Đã cập nhật vai trò.'
                          )
                        }
                      >
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <span
                        className={`admin-state ${
                          item.active ? 'enabled' : 'disabled'
                        }`}
                      >
                        {item.active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>

                    <td>{formatDate(item.lastLoginAt)}</td>

                    <td className="admin-table-actions">

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
                            item.active
                              ? 'Đã khóa người dùng.'
                              : 'Đã mở khóa người dùng.'
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
                          if (
                            window.confirm(
                              `Xóa quyền truy cập của @${item.githubLogin}?`
                            )
                          ) {
                            perform(
                              () => deleteAdminUser(item._id),
                              'Đã xóa người dùng.'
                            );
                          }
                        }}
                      >
                        Xóa
                      </button>

                    </td>
                  </tr>
                ))}

                {!users.length && (
                  <tr>
                    <td colSpan="5">
                      Chưa có người dùng nào. Người dùng được cấu hình
                      trong GITHUB_OAUTH_ALLOWED_USERS sẽ xuất hiện
                      sau lần đăng nhập đầu tiên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* =================================
          4. ALERT RULES + HISTORY
      ================================= */}

      {activeSection === 'alerts' && (
        <section className="admin-two-column">

          {/* Quy tắc cảnh báo */}
          <section className="panel admin-panel">

            <div className="panel-heading">
              <div>
                <h2>Quy tắc cảnh báo</h2>

                <p className="muted">
                  Cảnh báo trong ứng dụng khi GitHub gửi webhook
                  workflow_run hoàn tất.
                </p>
              </div>
            </div>

            <form
              className="admin-rule-form"
              onSubmit={(event) => {
                event.preventDefault();

                perform(async () => {
                  await addAlertRule(ruleForm);

                  setRuleForm({
                    name: '',
                    triggerOn: 'failure',
                    repository: '',
                    branch: ''
                  });
                }, 'Đã tạo quy tắc cảnh báo.');
              }}
            >
              <label>
                Tên quy tắc

                <input
                  value={ruleForm.name}
                  maxLength={100}
                  onChange={(event) =>
                    setRuleForm({
                      ...ruleForm,
                      name: event.target.value
                    })
                  }
                  required
                />
              </label>

              <label>
                Khi nào

                <select
                  value={ruleForm.triggerOn}
                  onChange={(event) =>
                    setRuleForm({
                      ...ruleForm,
                      triggerOn: event.target.value
                    })
                  }
                >
                  <option value="failure">Workflow thất bại</option>
                  <option value="success">Workflow thành công</option>
                  <option value="any">Mọi kết quả</option>
                </select>
              </label>

              <label>
                Repository

                <select
                  value={ruleForm.repository}
                  onChange={(event) =>
                    setRuleForm({
                      ...ruleForm,
                      repository: event.target.value
                    })
                  }
                >
                  <option value="">Tất cả repositories</option>

                  {ruleData.repositories.map((repo) => (
                    <option key={repo._id} value={repo._id}>
                      {repo.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nhánh (để trống = tất cả)

                <input
                  value={ruleForm.branch}
                  onChange={(event) =>
                    setRuleForm({
                      ...ruleForm,
                      branch: event.target.value
                    })
                  }
                  placeholder="main"
                />
              </label>

              <button
                type="submit"
                className="button primary button-sm"
                disabled={busy}
              >
                Tạo quy tắc
              </button>
            </form>

            <div className="admin-list">
              {ruleData.rules.map((rule) => (
                <div className="admin-list-row" key={rule._id}>

                  <div>
                    <strong>{rule.name}</strong>

                    <span>
                      {rule.repository?.fullName || 'Tất cả repositories'}
                      {' · '}
                      {rule.branch || 'Mọi nhánh'}
                      {' · '}
                      {rule.triggerOn}
                    </span>
                  </div>

                  <div className="admin-table-actions">

                    <button
                      className="button secondary button-sm"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        perform(
                          () =>
                            updateAlertRule(rule._id, {
                              enabled: !rule.enabled
                            }),
                          rule.enabled
                            ? 'Đã tắt quy tắc.'
                            : 'Đã bật quy tắc.'
                        )
                      }
                    >
                      {rule.enabled ? 'Đang bật' : 'Đã tắt'}
                    </button>

                    <button
                      className="button danger button-sm"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Xóa quy tắc "${rule.name}"?`
                          )
                        ) {
                          perform(
                            () => deleteAlertRule(rule._id),
                            'Đã xóa quy tắc.'
                          );
                        }
                      }}
                    >
                      Xóa
                    </button>

                  </div>
                </div>
              ))}

              {!ruleData.rules.length && (
                <p className="admin-empty">
                  Chưa có quy tắc cảnh báo.
                </p>
              )}
            </div>

          </section>

          {/* Lịch sử cảnh báo */}
          <section className="panel admin-panel">

            <div className="panel-heading">
              <div>
                <h2>Lịch sử cảnh báo</h2>

                <p className="muted">
                  Tự cập nhật mỗi 15 giây.
                </p>
              </div>
            </div>

            <div className="admin-list">

              {notifications.map((item) => (
                <div
                  className={`admin-list-row ${
                    item.readAt ? '' : 'unread'
                  }`}
                  key={item._id}
                >
                  <div>
                    <strong>{item.message}</strong>

                    <span>
                      {item.repository?.fullName || 'Repository'}
                      {' · '}
                      {item.rule?.name || 'Quy tắc đã xóa'}
                      {' · '}
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {!item.readAt && (
                    <button
                      className="button secondary button-sm"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        perform(
                          () => markAlertRead(item._id),
                          'Đã đánh dấu cảnh báo đã xem.'
                        )
                      }
                    >
                      Đã xem
                    </button>
                  )}

                </div>
              ))}

              {!notifications.length && (
                <p className="admin-empty">
                  Chưa có cảnh báo. Kiểm tra cấu hình webhook
                  GitHub để nhận sự kiện.
                </p>
              )}

            </div>
          </section>

        </section>
      )}

      {/* =================================
          5. REPOSITORIES
      ================================= */}

      {activeSection === 'repositories' && (
        <section className="panel admin-panel">

          <div className="panel-heading">
            <div>
              <h2>Repositories được giám sát</h2>

              <p className="muted">
                Bật/tắt giám sát; repository vẫn được lưu trong hệ thống.
              </p>
            </div>
          </div>

          <div className="admin-list">

            {repositories.map((repository) => (
              <div className="admin-list-row" key={repository._id}>

                <div>
                  <strong>{repository.fullName}</strong>

                  <span>
                    {repository.lastSyncedAt
                      ? `Đồng bộ: ${formatDate(repository.lastSyncedAt)}`
                      : 'Chưa đồng bộ'}
                  </span>
                </div>

                <button
                  className={`button button-sm ${
                    repository.monitoringEnabled !== false
                      ? 'secondary'
                      : 'primary'
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
                        ? 'Đã tắt giám sát repository.'
                        : 'Đã bật giám sát repository.'
                    )
                  }
                >
                  {repository.monitoringEnabled !== false
                    ? 'Đang theo dõi'
                    : 'Bật theo dõi'}
                </button>

              </div>
            ))}

            {!repositories.length && (
              <p className="admin-empty">
                Chưa có repository. Hãy tải repositories từ GitHub.
              </p>
            )}

          </div>
        </section>
      )}

      {/* =================================
          6. ACTIVITY LOG
      ================================= */}

      {activeSection === 'activity' && (
        <section className="panel admin-panel">

          <div className="panel-heading">
            <div>
              <h2>Nhật ký hoạt động</h2>

              <p className="muted">
                Các hoạt động đăng nhập và thay đổi cấu hình gần đây.
              </p>
            </div>
          </div>

          <div className="admin-list">

            {activity.map((entry) => (
              <div className="admin-list-row" key={entry._id}>

                <div>
                  <strong>{entry.action}</strong>

                  <span>
                    {entry.actorLogin}
                    {entry.target ? ` · ${entry.target}` : ''}
                    {' · '}
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

              </div>
            ))}

            {!activity.length && (
              <p className="admin-empty">
                Chưa có hoạt động được ghi nhận.
              </p>
            )}

          </div>
        </section>
      )}

    </div>
  );
}
