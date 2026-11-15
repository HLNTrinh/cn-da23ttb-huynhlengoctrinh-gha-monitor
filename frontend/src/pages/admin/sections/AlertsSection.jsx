import { useState } from 'react';
import {
  addAlertRule,
  deleteAlertRule,
  markAlertRead,
  updateAlertRule
} from '../../../services/adminApi.js';
import { formatExactDate, getRelativeTime } from '../adminFormat.js';
import { ellipsisStyles, rowStyles } from '../adminStyles.js';

const EMPTY_RULE_FORM = {
  name: '',
  triggerOn: 'failure',
  repository: '',
  branch: ''
};

export default function AlertsSection({ ruleData, notifications, busy, perform }) {
  // Form quy tắc cảnh báo
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE_FORM);

  return (
    <section className="admin-two-column">
      <section className="panel admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Thiết lập quy tắc cảnh báo</h2>
            <p className="muted">
              Tự động ghi nhận thông báo khi có workflow hoàn thành hoặc thất bại.
            </p>
          </div>
        </div>

        <form
          className="admin-form-block"
          onSubmit={(event) => {
            event.preventDefault();
            perform(async () => {
              await addAlertRule(ruleForm);
              setRuleForm(EMPTY_RULE_FORM);
            }, 'Đã thêm quy tắc cảnh báo mới.');
          }}
        >
          <div className="form-grid-2">
            <label>
              Tên quy tắc
              <input
                value={ruleForm.name}
                maxLength={100}
                onChange={(event) => setRuleForm({ ...ruleForm, name: event.target.value })}
                placeholder="Ví dụ: Báo lỗi build production"
                required
              />
            </label>

            <label>
              Điều kiện kích hoạt
              <select
                value={ruleForm.triggerOn}
                onChange={(event) => setRuleForm({ ...ruleForm, triggerOn: event.target.value })}
              >
                <option value="failure">Workflow thất bại (failure)</option>
                <option value="success">Workflow thành công (success)</option>
                <option value="any">Tất cả trạng thái (any)</option>
              </select>
            </label>

            <label>
              Áp dụng cho Kho lưu trữ
              <select
                value={ruleForm.repository}
                onChange={(event) => setRuleForm({ ...ruleForm, repository: event.target.value })}
              >
                <option value="">Tất cả kho lưu trữ</option>
                {ruleData.repositories.map((repo) => (
                  <option key={repo._id} value={repo._id}>
                    {repo.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Nhánh áp dụng (bỏ trống = mọi nhánh)
              <input
                value={ruleForm.branch}
                onChange={(event) => setRuleForm({ ...ruleForm, branch: event.target.value })}
                placeholder="main"
              />
            </label>
          </div>

          <button type="submit" className="button primary button-sm" disabled={busy}>
            + Tạo quy tắc cảnh báo
          </button>
        </form>

        <div className="admin-list-container">
          <h4 className="form-subheading" style={{ padding: '16px 20px 8px' }}>Các quy tắc đang hoạt động</h4>
          <div className="admin-list">
            {ruleData.rules.map((rule) => (
              <div className="admin-list-row" style={rowStyles.row} key={rule._id}>
                <div style={ellipsisStyles.box}>
                  <strong style={ellipsisStyles.oneLine} title={rule.name}>
                    {rule.name}
                  </strong>
                  <span className="muted text-sm" style={ellipsisStyles.oneLine}>
                    {rule.repository?.fullName || 'Tất cả kho lưu trữ'} · {rule.branch || 'Mọi nhánh'} ·{' '}
                    <span className={`trigger-tag ${rule.triggerOn}`}>
                      {rule.triggerOn === 'failure'
                        ? 'Khi thất bại'
                        : rule.triggerOn === 'success'
                          ? 'Khi thành công'
                          : 'Mọi kết quả'}
                    </span>
                  </span>
                </div>

                <div className="admin-table-actions" style={rowStyles.actions}>
                  <button
                    className={`button button-sm ${rule.enabled ? 'secondary' : 'primary'}`}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      perform(
                        () => updateAlertRule(rule._id, { enabled: !rule.enabled }),
                        rule.enabled ? 'Đã tắt quy tắc.' : 'Đã bật quy tắc.'
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
                      if (window.confirm(`Xác nhận xóa quy tắc "${rule.name}"?`)) {
                        perform(() => deleteAlertRule(rule._id), 'Đã xóa quy tắc cảnh báo.');
                      }
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {!ruleData.rules.length && (
              <p className="admin-empty">Chưa có quy tắc cảnh báo nào được tạo.</p>
            )}
          </div>
        </div>
      </section>

      {/* Lịch sử cảnh báo */}
      <section className="panel admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Lịch sử cảnh báo đã phát</h2>
            <p className="muted">Tự động cập nhật mỗi 15 giây</p>
          </div>
        </div>

        <div className="admin-list">
          {notifications.map((item) => (
            <div
              className={`admin-list-row notification-item ${item.readAt ? 'read' : 'unread'}`}
              style={rowStyles.row}
              key={item._id}
            >
              <div className="notif-content" style={ellipsisStyles.box}>
                <strong style={ellipsisStyles.twoLines} title={item.message}>
                  {item.message}
                </strong>
                <div className="notif-meta">
                  <span className="repo-pill">{item.repository?.fullName || 'Kho lưu trữ'}</span>
                  <span className="muted text-sm">
                    Quy tắc: {item.rule?.name || 'Đã xóa'} · {getRelativeTime(item.createdAt)}
                  </span>
                  <small className="muted text-xs">({formatExactDate(item.createdAt)})</small>
                </div>
              </div>

              {!item.readAt && (
                <button
                  className="button secondary button-sm notif-read-btn"
                  style={rowStyles.actions}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    perform(() => markAlertRead(item._id), 'Đã đánh dấu cảnh báo đã xem.')
                  }
                  title="Đánh dấu đã đọc"
                >
                  ✓ Đã xem
                </button>
              )}
            </div>
          ))}

          {!notifications.length && (
            <p className="admin-empty">Chưa có cảnh báo nào được gửi.</p>
          )}
        </div>
      </section>
    </section>
  );
}