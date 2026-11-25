import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ChartPanel from '../components/ChartPanel'
const fmt = v => Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2})
export default function Energy({data}) {
 const state = data.observations.filter(o=>o.territories?.slug==='bahia')
 const energy = state.filter(o=>o.sources?.institution==='EPE')
 const social = state.filter(o=>o.sources?.institution==='IPEA')
 const names=[...new Set(energy.map(o=>o.indicators?.name).filter(Boolean))]
 const ivs=[...new Set(social.map(o=>o.indicators?.name).filter(Boolean))]
 const years=[...new Set(social.map(o=>o.year))].sort((a,b)=>a-b)
 const socialRows=ivs.map(n=>({indicador:n,...Object.fromEntries(years.map(y=>[String(y),social.find(o=>o.year===y&&o.indicators?.name===n)?.value??null]))}))
 return <><div className="section-intro"><div><span className="eyebrow">BAHIA · ESCALA ESTADUAL</span><h2>Contexto energético e social</h2><p>EPE e IPEA complementam a comparação local do IBGE, sem atribuição aos bairros.</p></div></div>
 <div className="notice">Esta tela consulta exclusivamente o contexto estadual da Bahia. Os anos do IVS são históricos e não representam o Censo 2022.</div>
 <div className="analysis-grid">{names.map(n=>{const items=energy.filter(o=>o.indicators?.name===n).sort((a,b)=>a.year-b.year);const unit=items[0]?.indicators?.unit;return <ChartPanel key={n} title={n} subtitle={`EPE · Bahia · ${unit}`}><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={items}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="year"/><YAxis tickFormatter={fmt} width={90}/><Tooltip formatter={v=>[`${fmt(v)} ${unit}`,n]}/><Bar dataKey="value" name={n} fill="#d7f36a"/></BarChart></ResponsiveContainer></div></ChartPanel>})}</div>
 {!energy.length&&<p className="empty">Sem observações da EPE para os filtros selecionados.</p>}
 <ChartPanel title="Índice de Vulnerabilidade Social" subtitle="IPEA · Bahia · escala de 0 a 1 · contexto histórico">{social.length?<div className="chart-box tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={socialRows}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="indicador" interval={0} angle={-15} textAnchor="end" height={90} tick={{fontSize:10}}/><YAxis domain={[0,1]}/><Tooltip formatter={fmt}/><Legend/>{years.map((y,i)=><Bar key={y} dataKey={String(y)} fill={i%2?'#ff8068':'#d7f36a'}/>)}</BarChart></ResponsiveContainer></div>:<p className="empty">Sem observações do IPEA para os filtros selecionados.</p>}</ChartPanel>
 <ChartPanel title="Rastreabilidade" subtitle="Valores por indicador, fonte e ano"><div className="table-scroll"><table><thead><tr><th>Indicador</th><th>Fonte</th><th>Ano</th><th>Valor</th><th>Unidade</th><th>Classificação</th></tr></thead><tbody>{[...energy,...social].map(o=><tr key={o.id}><td>{o.indicators?.name}</td><td>{o.sources?.institution}</td><td>{o.year}</td><td>{fmt(o.value)}</td><td>{o.indicators?.unit}</td><td>{o.classification}</td></tr>)}</tbody></table></div></ChartPanel></>
}
