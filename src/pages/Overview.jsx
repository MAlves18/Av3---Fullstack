import { Users, House, Wallet, Lightbulb } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import TerritorialCharts, {scope,fmt} from '../components/TerritorialCharts'
export default function Overview({data}) {
 const {territories,year,get}=scope(data)
 const metrics=[['População residente','População residente','pessoas',Users],['Domicílios particulares','Domicílios particulares','domicílios',House],['Rendimento médio mensal do responsável','Rendimento médio mensal','R$',Wallet],['Domicílios em vias com iluminação pública','Domicílios em vias com iluminação pública (%)','%',Lightbulb]]
 return <><div className="section-intro"><div><span className="eyebrow">SALVADOR · BAHIA</span><h2>Visão geral</h2><p>Indicadores por bairro, no mesmo ano de referência: {year??'sem dados'}.</p></div></div>
 {territories.map(t=><section key={t.id}><h3 className="territory-heading">{t.name}</h3><div className="metrics-grid">{metrics.map(([title,name,unit,Icon])=>{const o=get(t,name);return <MetricCard key={name} label={title} value={o?fmt(o.value):null} unit={unit} note={o?`${o.sources?.institution ?? "Fonte não informada"} · ${o.year} · ${o.classification}`:'Sem dado disponível'} icon={Icon}/>})}</div></section>)}
 <TerritorialCharts data={data}/><div className="notice"><strong>Limitações:</strong> Água, esgoto e lixo usam os universos das categorias publicadas; rede geral ou pluvial não comprova tratamento do esgoto. Banheiro não comprova esgotamento adequado. Iluminação pública caracteriza o entorno, não a qualidade do fornecimento residencial. Rendimento refere-se ao responsável, não à renda familiar. Percentuais seguem as fórmulas cadastradas na base.</div></>
}
