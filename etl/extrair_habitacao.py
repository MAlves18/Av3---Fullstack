"""Extrai variáveis de banheiro confirmadas no material oficial IBGE, sem imputação."""
import csv, zipfile, io, sys
from pathlib import Path
from decimal import Decimal
CODES={'2927408018':'beiru-tancredo-neves','2927408117':'pernambues'}
FIELDS=[('Domicílios com 1 banheiro (%)',[232]),('Domicílios com 2 ou mais banheiros (%)',[233,234,235]),('Domicílios apenas com sanitário ou buraco (%)',[237]),('Domicílios sem banheiro ou sanitário (%)',[238])]
COLS='territory_slug indicator_name description unit dimension methodology classification source_institution source_title source_url source_scale year value geographic_scale notes'.split()
def extract(path):
 with zipfile.ZipFile(path) as z:
  name=next(n for n in z.namelist() if n.lower().endswith('.csv'))
  with z.open(name) as f:
   rows=[r for r in csv.DictReader(io.TextIOWrapper(f,encoding='latin1'),delimiter=';') if r['CD_BAIRRO'] in CODES]
 assert len(rows)==2 and {r['CD_BAIRRO'] for r in rows}==set(CODES)
 out=[]
 for r in rows:
  v={i:int(r[f'V{i:05}']) for i in range(232,239)}
  assert all(x>=0 for x in v.values()) and sum(v.values())>0
  for title,nums in FIELDS:
   formula='100 × ('+' + '.join(f'V{i:05}' for i in nums)+') / (V00232 + V00233 + V00234 + V00235 + V00236 + V00237 + V00238)'
   out.append(dict(zip(COLS,[CODES[r['CD_BAIRRO']],title,title,'%','Habitacional',formula,'Indicador derivado','IBGE','Censo 2022 - '+name,'https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/','Bairro',2022,str(round(Decimal(100)*sum(v[i] for i in nums)/sum(v.values()),4)),'bairro',f"Código {r['CD_BAIRRO']}; denominador {sum(v.values())}; numerador {sum(v[i] for i in nums)}; categorias de banheiro não medem esgotamento"])))
 return out
if __name__=='__main__':
 rows=extract(sys.argv[1]); dest=Path(sys.argv[2]);
 with dest.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=COLS);w.writeheader();w.writerows(rows)
 print(f'{len(rows)} registros validados')
