export function MetricCard({ title, value, detail, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{Icon ? <Icon size={20} /> : null}</div>
      <p className="metric-title">{title}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </div>
  );
}