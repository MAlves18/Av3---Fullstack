export default function MetricCard({ label, value, unit, note, icon: Icon }) {
  return <article className="metric-card">
    <div className="metric-top"><span>{label}</span>{Icon && <Icon size={18}/>}</div>
    <div className="metric-value">{value ?? '—'} <small>{value != null ? unit : ''}</small></div>
    <p>{note || 'Sem observação cadastrada para os filtros selecionados.'}</p>
  </article>
}
