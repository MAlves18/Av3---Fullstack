import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ChartPanel from './ChartPanel'
export const fmt = n => n == null ? '—' : Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2})
export const label = n => n === 'Rendimento médio mensal' ? 'Rendimento médio mensal do responsável' : n
export const groups = [
["Saneamento — água", "%", ["Domicílios que utilizam rede geral de água (%)", "Domicílios com água encanada internamente (%)"]],
["Saneamento — esgoto", "%", ["Domicílios com esgoto em rede geral ou pluvial (%)", "Domicílios com esgoto em rede ou fossa séptica/filtro (%)", "Domicílios com outras destinações de esgoto ou sem sanitário (%)"]],
["Saneamento — lixo", "%", ["Domicílios com lixo coletado ou em caçamba de limpeza (%)", "Domicílios com lixo jogado em terreno ou área pública (%)"]],
["Alfabetização — 15 anos ou mais", "%", ["Pessoas de 15 anos ou mais alfabetizadas (%)", "Pessoas de 15 anos ou mais não alfabetizadas (%)"]],
["Composição etária", "%", ["Moradores de 0 a 14 anos (%)", "Moradores de 15 a 59 anos (%)", "Moradores de 60 anos ou mais (%)"]],
 ['População e domicílios','Quantidade',['População residente','Domicílios particulares']],
 ['Rendimento dos responsáveis','R$',['Rendimento médio mensal','Rendimento mediano mensal do responsável']],
 ['Infraestrutura urbana — quantidade','domicílios',['Domicílios em vias pavimentadas','Domicílios em vias com bueiro','Domicílios em vias com iluminação pública','Domicílios em vias com calçada','Domicílios em vias sem árvores']],
 ['Infraestrutura urbana — proporção','%',['Domicílios em vias pavimentadas (%)','Domicílios em vias com iluminação pública (%)','Domicílios em vias sem árvores (%)']],
 ['Densidade demográfica','pessoas/km²',['Densidade demográfica']],
 ['Área territorial','km²',['Área territorial']],
 ['Condições habitacionais — banheiro','%',['Domicílios com 1 banheiro (%)','Domicílios com 2 ou mais banheiros (%)','Domicílios apenas com sanitário ou buraco (%)','Domicílios sem banheiro ou sanitário (%)']]
]
export function scope(data){
 const territories=data.territories.filter(t=>['beiru-tancredo-neves','pernambues'].includes(t.slug) && (data.territoryId==='all'||!data.territoryId||String(t.id)===String(data.territoryId)))
 const years=[...new Set(data.observations.filter(o=>territories.some(t=>t.id===o.territories?.id)).map(o=>o.year))].sort((a,b)=>b-a)
 const year=years[0]; const observations=data.observations.filter(o=>o.year===year)
 const get=(t,n)=>observations.find(o=>o.territories?.id===t.id&&o.indicators?.name===n)
 return {territories,year,get}
}
export default function TerritorialCharts({data}){
 const {territories,year,get}=scope(data)
 return <div className="analysis-grid">{groups.map(([title,unit,names])=>{
 const rows=names.map(n=>({indicador:label(n).replace('Domicílios em vias ','').replace('Rendimento ','').replace(' (%)',''),...Object.fromEntries(territories.map(t=>[t.slug,get(t,n)?.value??null]))}))
 const available=rows.some(r=>territories.some(t=>r[t.slug]!=null))
 return <ChartPanel key={title} title={title} subtitle={`${year??'Ano indisponível'} · ${unit} · dados cadastrados no Supabase`}>
 {available?<div className="chart-box tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{bottom:45,left:12,right:8}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="indicador" interval={0} angle={-20} textAnchor="end" height={95} tick={{fontSize:10}}/><YAxis domain={unit==='%'?[0,100]:[0,'auto']} tickFormatter={fmt}/><Tooltip formatter={(v,n)=>[`${fmt(v)} ${unit}`,n]}/><Legend/><>{territories.map(t=><Bar key={t.slug} dataKey={t.slug} name={t.name} fill={t.slug==='pernambues'?'#e9a04a':'#087e8b'} radius={[4,4,0,0]}/>)}</></BarChart></ResponsiveContainer></div>:<p className="empty">Sem dados para os filtros selecionados.</p>}
 </ChartPanel>})}</div>
}
