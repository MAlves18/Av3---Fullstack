export default function ChartPanel({ title, subtitle, children, className = '' }) {
  return <section className={`panel ${className}`}>
    <div className="panel-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div></div>
    {children}
  </section>
}
