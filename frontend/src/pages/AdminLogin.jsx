import { useState } from 'react';
import { loginAdmin } from '../services/adminApi.js';

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const session = await loginAdmin({ email, password });
      onSuccess(session);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-mark" aria-hidden="true">A</div>
        <p className="eyebrow">ADMIN PORTAL</p>
        <h1>Đăng nhập quản trị</h1>
        <p className="muted">Cổng quản trị sử dụng tài khoản email và mật khẩu riêng.</p>
        {error && <div className="notice error-notice" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email quản trị<input type="email" autoComplete="username" maxLength="254" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Mật khẩu<input type="password" autoComplete="current-password" maxLength="256" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="button primary" type="submit" disabled={submitting}>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}</button>
        </form>
      </section>
    </main>
  );
}
