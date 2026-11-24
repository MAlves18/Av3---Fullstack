import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { scope, fmt } from './TerritorialCharts'
const codes={'2927408018':'beiru-tancredo-neves','2927408117':'pernambues'}
const colors=['#e8f3ef','#99c9ba','#237e78']
const missing='#a8afb7'
function Fit({geo}) { const map=useMap(); useEffect(()=>{if(geo.features.length){const b=L.geoJSON(geo).getBounds();if(b.isValid())map.fitBounds(b,{padding:[25,25],maxZoom:15})}},[geo,map]);return null }
export default function TerritoryMap({data}) {
 const {territories,year,get}=scope(data)
 const [geo,setGeo]=useState(null),[error,setError]=useState(''),[indicator,setIndicator]=useState('Rendimento médio mensal')
 useEffect(()=>{let live=true;fetch(`${import.meta.env.BASE_URL}data/territorios.geojson`).then(r=>{if(!r.ok)throw Error('Arquivo não encontrado');return r.json()}).then(g=>{if(g.type!=='FeatureCollection'||g.features.length!==2||new Set(g.features.map(f=>f.properties?.CD_BAIRRO)).size!==2||!g.features.every(f=>codes[f.properties?.CD_BAIRRO]&&['Polygon','MultiPolygon'].includes(f.geometry?.type)))throw Error('Malha ausente ou inválida');if(live)setGeo(g)}).catch(e=>{if(live)setError(e.message)});return()=>{live=false}},[])
 const options=[...new Map(data.observations.filter(o=>o.year===year&&o.sources?.institution==='IBGE'&&territories.some(t=>t.id===o.territories?.id)&&o.indicators).map(o=>[o.indicators.name,o.indicators])).values()].sort((a,b)=>a.name.localeCompare(b.name))
 const selected=options.find(i=>i.name===indicator)||options[0]
 const rows=territories.map(t=>({t,o:selected?get(t,selected.name):null}))
 const vals=rows.filter(r=>r.o?.value!=null&&Number.isFinite(Number(r.o.value))).map(r=>Number(r.o.value))
 const min=vals.length?Math.min(...vals):0,max=vals.length?Math.max(...vals):0
 const color=v=>v==null||!Number.isFinite(Number(v))?missing:min===max?colors[1]:colors[Math.min(2,Math.floor(3*(Number(v)-min)/(max-min)))]
 const filtered=useMemo(()=>({type:'FeatureCollection',features:(geo?.features||[]).filter(f=>territories.some(t=>t.slug===codes[f.properties.CD_BAIRRO]))}),[geo,territories.map(t=>t.slug).join(',')])
 const lookup=f=>rows.find(r=>r.t.slug===codes[f.properties.CD_BAIRRO])
 const key=JSON.stringify([selected?.name,year,rows.map(r=>[r.t.slug,r.o?.value])])
 return <>
 <label className="map-selector">Camada temática <select value={selected?.name||''} onChange={e=>setIndicator(e.target.value)}>{!options.length&&<option value="">Sem indicadores</option>}{options.map(i=><option key={i.name}>{i.name}</option>)}</select></label>
 <p className="method-hint">IBGE · {year??'Ano indisponível'} · {selected?.unit||'—'} · escala bairro. Cores representam magnitude, não classificação de risco.</p>
 <div className="map-wrap"><MapContainer center={[-12.96,-38.48]} zoom={12} className="leaflet-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{filtered.features.length>0&&<><GeoJSON key={key} data={filtered} style={f=>({color:'#23505b',weight:2,fillColor:color(lookup(f)?.o?.value),fillOpacity:.8})} onEachFeature={(f,layer)=>{const r=lookup(f);const el=document.createElement('div');[r?.t.name,selected?.name,`${fmt(r?.o?.value)} ${selected?.unit||''}`,`IBGE · ${year??'—'} · ${r?.o?.classification||'Sem dado'}`].forEach(s=>{const p=document.createElement('p');p.textContent=s||'';el.appendChild(p)});layer.bindPopup(el)}}/><Fit geo={filtered}/></>}</MapContainer>{!geo&&<div className="map-note"><strong>{error?'Limites oficiais ainda não disponíveis':'Carregando malha oficial...'}</strong><span>Execute o conversor IBGE descrito em docs/mapa-v4.md. Nenhum polígono aproximado será exibido.</span></div>}</div>
 <div className="map-legend"><strong>Legenda · {selected?.unit||'—'}</strong>{vals.length>0&&(min===max?<span><i style={{background:colors[1]}}/> {fmt(min)} (valor único ou igual)</span>:<>{colors.map((c,i)=><span key={c}><i style={{background:c}}/> {i===0?'Menor':i===1?'Intermediário':'Maior'}: {fmt(min+(max-min)*i/3)} – {fmt(min+(max-min)*(i+1)/3)}</span>)}</>)}<span><i style={{background:missing}}/> Sem dado</span></div>
 <div className="table-scroll"><table><thead><tr><th>Bairro</th><th>Valor</th><th>Classificação</th><th>Fonte / ano</th></tr></thead><tbody>{rows.map(({t,o})=><tr key={t.id}><td>{t.name}</td><td>{fmt(o?.value)} {selected?.unit}</td><td>{o?.classification||'Sem dado'}</td><td>{o?.sources?.institution||'—'} / {o?.year||'—'}</td></tr>)}</tbody></table></div>
 <p className="method-hint">{selected?.methodology||'Metodologia indisponível.'} As faixas são relativas aos bairros selecionados; não constituem um índice oficial de vulnerabilidade.</p>
 </>
}
