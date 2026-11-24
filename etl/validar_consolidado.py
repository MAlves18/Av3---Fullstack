import csv, json
from pathlib import Path
from decimal import Decimal
from collections import Counter
root=Path(__file__).resolve().parent
rows=[]
for name in ('dados_normalizados.csv','dados_ipea_epe_normalizados.csv','dados_habitacao.csv','dados_v5.csv'):
    with (root/name).open(encoding='utf-8-sig') as f: rows.extend(csv.DictReader(f))
keys=set()
for r in rows:
    key=tuple(r[k] for k in ('territory_slug','indicator_name','source_institution','source_title','year','geographic_scale'))
    assert key not in keys, key
    keys.add(key)
    v=Decimal(r['value']); assert v.is_finite()
    assert r['methodology'] and r['source_url']
    assert (r['territory_slug']=='bahia') == (r['geographic_scale'].lower()=='estadual')
    if r['unit']=='%': assert 0<=v<=100
assert len(rows)==86 and len({r['indicator_name'] for r in rows})==40
with (root/'dados_consolidados.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
print(json.dumps({'observacoes':len(rows),'indicadores':40,'fontes':Counter(r['source_institution'] for r in rows),'territorios':Counter(r['territory_slug'] for r in rows),'duplicidades':0},ensure_ascii=False,indent=2))
