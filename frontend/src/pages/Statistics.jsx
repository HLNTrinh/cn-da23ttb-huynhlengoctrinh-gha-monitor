import { useEffect, useState } from 'react';
import StatisticCard from '../components/StatisticCard.jsx';
import { ErrorState, Loading } from '../components/PageState.jsx';
import { getStatistics } from '../services/statisticsApi.js';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getStatistics().then(setStats).catch((cause) => setError(cause.message)); }, []);
  if (!stats && !error) return <Loading />;
  if (error) return <ErrorState message={error} />;
  const max = Math.max(1, ...stats.daily.map((day) => day.total));
  return <>
    <p className="muted page-intro">Phân tích hiệu quả workflow trong 30 ngày gần nhất.</p>
    <section className="stat-grid"><StatisticCard label="Workflow runs" value={stats.total} tone="blue" /><StatisticCard label="Tỷ lệ thành công" value={`${stats.successRate}%`} tone="green" /><StatisticCard label="Runs thất bại" value={stats.failed} tone="red" /><StatisticCard label="Thời lượng trung bình" value={stats.averageDurationMs ? `${Math.round(stats.averageDurationMs / 60000)} phút` : '—'} tone="violet" /></section>
    <section className="panel chart-panel"><div className="panel-heading"><div><h2>Workflow runs theo ngày</h2><p className="muted">Số lần chạy mỗi ngày</p></div></div>
      {stats.daily.length ? <div className="bar-chart">{stats.daily.map((day) => <div className="bar-column" key={day._id} title={`${day._id}: ${day.total}`}><span className="bar-value">{day.total}</span><div className="bar" style={{ height: `${Math.max(4, (day.total / max) * 100)}%` }} /><small>{day._id.slice(5)}</small></div>)}</div> : <div className="empty-state">Chưa có dữ liệu thống kê.</div>}
    </section>
  </>;
}
