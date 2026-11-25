import ChartPanel from '../components/ChartPanel'
export default function Methodology({ data }) {
  return <>
    <ChartPanel title="Desafio analítico" subtitle=""><div className="analysis-findings"><h4>1. Perfil demográfico</h4><p>Pernambués tem maior população no agregado básico (52564 vs 38329). As proporções etárias publicadas mostram maior participação de 0–14 anos em Beiru (18,01% vs 15,81%).</p><h4>2. Rendimento</h4><p>Rendimento médio do responsável: R$ 2035,87 vs R$ 2316,25; mediana R$ 1212 em ambos. Não se conhece a distribuição completa nem a renda familiar.</p><h4>3. Habitação</h4><p>Outras destinações de esgoto ou ausência de sanitário: 1,49% vs 0,63%; lixo em terreno/área pública: 2,26% vs 4,32%. Universos específicos das categorias publicadas.</p><h4>4. Infraestrutura</h4><p>Iluminação no entorno: 97,62% vs 99,41%. Comparar também pavimentação, calçadas e arborização com as fórmulas cadastradas.</p><h4>5. Riscos energéticos</h4><p>Menor renda, condições habitacionais e urbanas podem sinalizar riscos, não comprovar privação energética. Não produzir índice oficial a partir dessas variáveis.</p><h4>6. Contexto estadual</h4><p>EPE Bahia: consumo residencial anual 7,56 milhões MWh (2022) e 8,05 milhões (2025); unidades consumidoras em dezembro 5,79 e 6,24 milhões. Contexto estadual, não consumo dos bairros. IPEA estadual histórico 2000/2010 não descreve situação atual local.</p><h4>7. Dados adicionais</h4><p>Dados necessários: despesas energéticas, renda familiar, acesso, interrupções, conforto térmico, equipamentos e necessidades das famílias.</p><h4>8. Prioridades</h4><p>Investigar saneamento em Beiru e destinação do lixo em Pernambués, além de barreiras econômicas e de infraestrutura em ambos. Prioridades preliminares, sujeitas a diagnóstico local e validação dos dados.</p></div></ChartPanel>
    <div className="section-intro"><div><span className="eyebrow">TRANSPARÊNCIA E RASTREABILIDADE</span><h2>Metodologia e fontes</h2><p>Origem, período, escala geográfica, classificação e limitações dos dados.</p></div></div>
    <div className="content-grid">
      <ChartPanel title="Classificação obrigatória" subtitle="Conforme o roteiro da AV3">
        <div className="definition-list">
          <div><span className="tag observed">Dado observado</span><p>Valor publicado diretamente pela fonte oficial para o território e período.</p></div>
          <div><span className="tag derived">Indicador derivado</span><p>Cálculo sobre variáveis oficiais com fórmula documentada.</p></div>
          <div><span className="tag proxy">Proxy / estimativa</span><p>Aproximação de fenômeno não medido diretamente; exige justificativa e limitações.</p></div>
        </div>
      </ChartPanel>
      <ChartPanel title="Cuidados metodológicos" subtitle="Limitações que devem acompanhar a análise">
        <ul className="method-list">
          <li>Baixa renda não comprova pobreza energética de uma família.</li>
          <li>Iluminação pública não mede continuidade ou qualidade do fornecimento residencial.</li>
          <li>Confirmar equivalência geográfica entre Beiru e Tancredo Neves nas bases e malhas oficiais.</li>
          <li>Não atribuir indicadores estaduais da EPE diretamente aos bairros.</li>
        </ul>
      </ChartPanel>
    </div>
    <ChartPanel title="Fontes cadastradas" subtitle="Instituições e referências documentadas no banco">
      <div className="table-scroll"><table><thead><tr><th>Instituição</th><th>Título</th><th>Escala</th><th>URL</th></tr></thead><tbody>
      {data.sources.map(s=><tr key={s.id}><td>{s.institution}</td><td>{s.title}</td><td>{s.geographic_scale || 'Não informada'}</td><td>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">Consultar fonte ↗</a> : '—'}</td></tr>)}
      {!data.sources.length && <tr><td colSpan="4" className="empty">Nenhuma fonte cadastrada.</td></tr>}
      </tbody></table></div>
    </ChartPanel>
    <ChartPanel title="Indicadores disponíveis" subtitle="Dicionário de indicadores">
      <div className="table-scroll"><table><thead><tr><th>Indicador</th><th>Dimensão</th><th>Unidade</th><th>Descrição</th><th>Metodologia</th></tr></thead><tbody>
      {[...new Map(data.observations.map(o=>[o.indicators?.id,o.indicators])).values()].filter(Boolean).map(i=><tr key={i.id}><td>{i.name}</td><td>{i.dimension}</td><td>{i.unit}</td><td>{i.description}</td><td>{i.methodology || "Não documentada"}</td></tr>)}
      </tbody></table></div>
    </ChartPanel>
  </>
}
