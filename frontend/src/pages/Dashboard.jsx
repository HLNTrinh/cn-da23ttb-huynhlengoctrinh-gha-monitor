import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatisticCard from '../components/StatisticCard.jsx';
import WorkflowTable from '../components/WorkflowTable.jsx';
import { ErrorState, Loading } from '../components/PageState.jsx';
import { getStatistics } from '../services/statisticsApi.js';
import { getRuns } from '../services/workflowApi.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [runs, setRuns] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let timer;
    async function refresh() {
      try {
        const [stats, recent] = await Promise.all([getStatistics(), getRuns('limit=8')]);
        if (active) {
          setData(stats);
          setRuns(recent.items);
          setError('');
        }
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) timer = window.setTimeout(refresh, 15000);
      }
    }
    refresh();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!data || !runs) return <Loading />;
  const maxDailyRuns = Math.max(1, ...data.daily.map((day) => day.total));
  const runStatuses = [
    { label: 'Thành công', value: data.successful, color: '#2bb77b' },
    { label: 'Thất bại', value: data.failed, color: '#e56772' },
    { label: 'Đang chạy', value: data.inProgress, color: '#4c8ee8' },
    { label: 'Khác', value: Math.max(0, data.total - data.successful - data.failed - data.inProgress), color: '#aab4c2' }
  ];
  let pieOffset = 0;
  const pieSegments = runStatuses.map((status) => {
    const start = pieOffset;
    pieOffset += data.total ? (status.value / data.total) * 100 : 0;
    return `${status.color} ${start}% ${pieOffset}%`;
  });
  return <>
    <section className="welcome-row"><div><p className="eyebrow">GITHUB ACTIONS </p><p className="muted">Tình trạng workflow runs mới nhất trên các repository đã kết nối.</p></div></section>
    <section className="stat-grid">
      <StatisticCard label="Tổng workflow runs" value={data.total} detail="Trong 30 ngày qua" />
      <StatisticCard label="Thành công" value={data.successful} detail={`${data.successRate}% success rate`} tone="green" />
      <StatisticCard label="Thất bại" value={data.failed} detail="Cần kiểm tra" tone="red" />
      <StatisticCard label="Đang chạy" value={data.inProgress} detail={data.averageDurationMs ? `Trung bình ${Math.round(data.averageDurationMs / 60000)} phút` : 'Chưa có thời gian chạy'} tone="violet" />
    </section>
    <section className="dashboard-charts" aria-label="Biểu đồ thống kê workflow">
      <div className="panel chart-panel"><div className="panel-heading"><div><h2>Mật độ workflow theo ngày</h2><p className="muted">Số lần chạy mỗi ngày trong 30 ngày qua</p></div></div>
        {data.daily.length ? <div className="bar-chart">{data.daily.map((day) => <div className="bar-column" key={day._id} title={`${day._id}: ${day.total} lần chạy`}><span className="bar-value">{day.total}</span><div className="bar" style={{ height: `${Math.max(4, (day.total / maxDailyRuns) * 100)}%` }} /><small>{day._id.slice(5)}</small></div>)}</div> : <div className="empty-state">Chưa có dữ liệu workflow trong 30 ngày qua.</div>}
      </div>
      <div className="panel chart-panel"><div className="panel-heading"><div><h2>Phân bố trạng thái</h2><p className="muted">Tỷ lệ workflow runs trong 30 ngày qua</p></div></div>
        {data.total ? <div className="pie-chart-content">
          <div className="pie-chart" role="img" aria-label={runStatuses.map((status) => `${status.label}: ${status.value}`).join(', ')} style={{ background: `conic-gradient(${pieSegments.join(', ')})` }}><div className="pie-chart-center"><strong>{data.total}</strong><span>lần chạy</span></div></div>
          <ul className="pie-legend">{runStatuses.map((status) => <li key={status.label}><span className="pie-legend-label"><span className="pie-legend-swatch" style={{ backgroundColor: status.color }} />{status.label}</span><strong>{status.value}</strong></li>)}</ul>
        </div> : <div className="empty-state">Chưa có dữ liệu workflow trong 30 ngày qua.</div>}
      </div>
    </section>
    <section className="panel"><div className="panel-heading"><div><h2>Workflow runs gần đây</h2><p className="muted">Các lần chạy mới nhất trên toàn bộ repository</p></div><Link to="/runs" className="text-link">Xem tất cả →</Link></div><WorkflowTable runs={runs} /></section>
  </>;
}
