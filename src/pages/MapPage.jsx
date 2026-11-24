import TerritoryMap from '../components/TerritoryMap'
import ChartPanel from '../components/ChartPanel'
export default function MapPage({data}) {
  return <>
    <div className="section-intro"><div><span className="eyebrow">DISTRIBUIÇÃO ESPACIAL</span><h2>Mapa de vulnerabilidade</h2><p>Visualização territorial para apoiar a leitura dos indicadores por bairro ou setor censitário.</p></div></div>
    <ChartPanel title="Territórios de Salvador" subtitle="Malha de bairros do Censo 2022 — IBGE, quando instalada; mapa-base OpenStreetMap.">
      <TerritoryMap data={data}/>
    </ChartPanel>
    <p className="method-hint">Não interprete a ausência de uma camada temática como ausência de vulnerabilidade. Para publicar limites, utilize malhas oficiais compatíveis com a escala do indicador e registre a fonte e o ano.</p>
  </>
}
