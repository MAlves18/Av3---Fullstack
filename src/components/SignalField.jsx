import { useMemo } from 'react'

// Visualização conceitual; não representa conexões geográficas reais.
export default function SignalField() {
  const nodes = useMemo(() => Array.from({ length: 74 }, (_, i) => ({
    x: 5 + ((i * 37) % 90),
    y: 8 + ((i * 53 + Math.floor(i / 4) * 11) % 82),
    r: i % 13 === 0 ? 3.1 : i % 5 === 0 ? 2.1 : 1.25,
    hot: i % 9 === 0,
    delay: `${(i % 12) * -0.32}s`
  })), [])
  const links = nodes.flatMap((n, i) => nodes.slice(i + 1)
    .filter(m => Math.hypot(n.x - m.x, n.y - m.y) < 14)
    .slice(0, 2).map(m => ({ x1: n.x, y1: n.y, x2: m.x, y2: m.y })))
  return <div className="signal-field" aria-label="Visualização abstrata de conexões entre indicadores">
    <div className="signal-topline"><span>CAMPO DE DADOS / SALVADOR</span><span className="live-mark"><i/> SISTEMA DE OBSERVAÇÃO</span></div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {links.map((l,i)=><line key={`l${i}`} {...l} className="signal-link"/>)}
      {nodes.map((n,i)=><circle key={i} cx={n.x} cy={n.y} r={n.r} className={n.hot?'signal-node hot':'signal-node'} style={{animationDelay:n.delay}}/>)}
    </svg>
    <div className="signal-caption"><strong>O território é um sistema de relações.</strong><span>Dados públicos · infraestrutura · condições de vida</span></div>
    <div className="signal-index">01—05 <span>OBSERVATÓRIO</span></div>
  </div>
}
