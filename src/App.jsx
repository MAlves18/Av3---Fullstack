import { useEffect, useState, lazy, Suspense } from 'react'
import { Menu, RefreshCw, AlertCircle, Database } from 'lucide-react'
import Sidebar from './components/Sidebar'
const Overview = lazy(() => import('./pages/Overview'))
const Compare = lazy(() => import('./pages/Compare'))
const MapPage = lazy(() => import('./pages/MapPage'))
const Energy = lazy(() => import('./pages/Energy'))
const Methodology = lazy(() => import('./pages/Methodology'))
import { loadDashboard, uniqueYears } from './lib/data'

const titles = { overview:'Visão geral', compare:'Comparativo territorial', map:'Mapa de vulnerabilidade', energy:'Análise energética', method:'Metodologia e fontes' }
export default function App() {
  const [active, setActive] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [territoryId, setTerritoryId] = useState('all')
  const [year, setYear] = useState('all')
  const [source, setSource] = useState('all')
  const [dimension, setDimension] = useState('all')
  const [data, setData] = useState({ observations:[], territories:[], sources:[], configured:false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    loadDashboard().then(result => { if (alive) setData(result) })
      .catch(e => { if (alive) setError(e.message || 'Erro ao consultar o Supabase.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reload])

  const local = ['overview','compare','map'].includes(active)
  const allowed = data.territories.filter(t => local ? ['beiru-tancredo-neves','pernambues'].includes(t.slug) : active==='energy' ? t.slug==='bahia' : true)
  const scoped = data.observations.filter(o=>allowed.some(t=>t.id===o.territories?.id))
  const years = uniqueYears(scoped)
  const institutions = [...new Set(scoped.map(o=>o.sources?.institution).filter(Boolean))].sort()
  const dimensions = [...new Set(scoped.map(o=>o.indicators?.dimension).filter(Boolean))].sort()
  const selected = allowed.some(t=>String(t.id)===territoryId)?territoryId:'all'
  const selectedYear = years.some(y=>String(y)===year)?year:'all'
  const viewData = {...data,territories:allowed,territoryId:selected,observations:scoped.filter(o=>(selected==='all'||String(o.territories?.id)===selected)&&(selectedYear==='all'||String(o.year)===selectedYear)&&(source==='all'||o.sources?.institution===source)&&(dimension==='all'||o.indicators?.dimension===dimension))}
  function navigate(page){setActive(page);setTerritoryId('all');setYear('all');setSource('all');setDimension('all')}
  const Page = { overview:Overview, compare:Compare, map:MapPage, energy:Energy, method:Methodology }[active]
  return <div className="app-shell">
    <Sidebar active={active} onChange={navigate} open={menuOpen} onClose={()=>setMenuOpen(false)}/>
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMenuOpen(true)} aria-label="Abrir menu"><Menu/></button>
        <div><span className="top-kicker">OBSERVATÓRIO DE VULNERABILIDADE SOCIOENERGÉTICA</span><h1>{titles[active]}</h1></div>
        <button className="refresh-btn" onClick={()=>setReload(x=>x+1)} title="Atualizar dados"><RefreshCw size={17}/><span>Atualizar</span></button>
      </header>
      <div className="filters">
        <label>Território
          <select value={selected} onChange={e=>setTerritoryId(e.target.value)}>
            <option value="all">Todos os territórios</option>
            {allowed.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label>Ano de referência
          <select value={selectedYear} onChange={e=>setYear(e.target.value)}>
            <option value="all">Todos os anos</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Fonte<select value={source} onChange={e=>setSource(e.target.value)}><option value="all">Todas</option>{institutions.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Dimensão<select value={dimension} onChange={e=>setDimension(e.target.value)}><option value="all">Todas</option>{dimensions.map(x=><option key={x}>{x}</option>)}</select></label>
        <span className="data-count"><Database size={15}/>{viewData.observations.length} observações</span>
      </div>
      {!data.configured && <div className="notice setup"><AlertCircle size={19}/><div><strong>Supabase ainda não configurado.</strong><span>Copie <code>.env.example</code> para <code>.env</code>, informe a URL e a chave anon do projeto e execute o SQL em <code>supabase/schema.sql</code>.</span></div></div>}
      {error && <div className="notice error"><strong>Falha ao carregar dados:</strong> {error}</div>}
      {loading ? <div className="loading">Carregando indicadores...</div> : <div className="page-content"><Suspense fallback={<div className="loading">Carregando tela...</div>}><Page data={viewData}/></Suspense></div>}
      <footer>Observatório Socioenergético · Projeto Integrador AV3 · Salvador/BA <span>Dados: IBGE · IPEA · EPE</span></footer>
    </main>
  </div>
}
