import { Activity, BarChart3, BookOpen, LayoutDashboard, Map, Zap } from 'lucide-react'

const items = [
  ['overview', 'Visão geral', LayoutDashboard],
  ['compare', 'Comparativo territorial', BarChart3],
  ['map', 'Mapa de vulnerabilidade', Map],
  ['energy', 'Análise energética', Zap],
  ['method', 'Metodologia e fontes', BookOpen],
]
export default function Sidebar({ active, onChange, open, onClose }) {
  return <>
    {open && <button className="scrim" aria-label="Fechar menu" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={23}/></div>
        <div><strong>OBSERVATÓRIO</strong><small>CAMPO SOCIOENERGÉTICO</small></div>
      </div>
      <div className="side-label">EXPLORAR</div>
      <nav aria-label="Navegação principal">
        {items.map(([id, label, Icon]) => <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => { onChange(id); onClose() }}>
          <Icon size={19}/><span>{label}</span>
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <span className="status-dot"/> PESQUISA TERRITORIAL
        <small>Salvador, Bahia</small>
      </div>
    </aside>
  </>
}
