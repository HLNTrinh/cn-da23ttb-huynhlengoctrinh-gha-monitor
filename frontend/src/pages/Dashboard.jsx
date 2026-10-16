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
    Promise.all([getStatistics(), getRuns('limit=8')]).then(([stats, recent]) => {
      setData(stats);
      setRuns(recent.items);
    }).catch((cause) => setError(cause.message));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!data || !runs) return <Loading />;
  return <>
    <section className="welcome-row"><div><p className="eyebrow">GITHUB ACTIONS · 30 NGÀY QUA</p><h2>Theo dõi CI/CD của bạn</h2><p className="muted">Tình trạng workflow runs mới nhất trên các repository đã kết nối.</p></div><Link className="button secondary" to="/repositories">Quản lý repositories <span>→</span></Link></section>
    <section className="stat-grid">
      <StatisticCard label="Tổng workflow runs" value={data.total} detail="Trong 30 ngày qua" />
      <StatisticCard label="Thành công" value={data.successful} detail={`${data.successRate}% success rate`} tone="green" />
      <StatisticCard label="Thất bại" value={data.failed} detail="Cần kiểm tra" tone="red" />
      <StatisticCard label="Đang chạy" value={data.inProgress} detail={data.averageDurationMs ? `Trung bình ${Math.round(data.averageDurationMs / 60000)} phút` : 'Chưa có thời gian chạy'} tone="violet" />
    </section>
    <section className="panel"><div className="panel-heading"><div><h2>Workflow runs gần đây</h2><p className="muted">Các lần chạy mới nhất trên toàn bộ repository</p></div><Link to="/runs" className="text-link">Xem tất cả →</Link></div><WorkflowTable runs={runs} /></section>
  </>;
}
