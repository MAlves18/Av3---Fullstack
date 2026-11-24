import csv,io,zipfile,sys
from pathlib import Path
from decimal import Decimal
from openpyxl import load_workbook
base=Path(sys.argv[1] if len(sys.argv)>1 else '.')
out=Path(sys.argv[2] if len(sys.argv)>2 else 'etl/dados_v5.csv')
dic=next(base.glob('dicionario_de_dados_agregados*20261113.xlsx'))
wb=load_workbook(dic,read_only=True,data_only=True)
d={r[2]:r[3] for r in wb['Dicionário não PCT'].values if r[2]}
codes={'2927408018':'beiru-tancredo-neves','2927408117':'pernambues'}
url='https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/'
def vs(a,b):return list(range(a,b+1))
specs=[('caracteristicas_domicilio2','Domicílios que utilizam rede geral de água (%)','Habitacional',[111],vs(111,118)),('caracteristicas_domicilio2','Domicílios com água encanada internamente (%)','Habitacional',[199],vs(199,201)),('caracteristicas_domicilio2','Domicílios com esgoto em rede geral ou pluvial (%)','Habitacional',[309],vs(309,316)),('caracteristicas_domicilio2','Domicílios com esgoto em rede ou fossa séptica/filtro (%)','Habitacional',vs(309,311),vs(309,316)),('caracteristicas_domicilio2','Domicílios com outras destinações de esgoto ou sem sanitário (%)','Habitacional',vs(312,316),vs(309,316)),('caracteristicas_domicilio2','Domicílios com lixo coletado ou em caçamba de limpeza (%)','Habitacional',[397,398],vs(397,402)),('caracteristicas_domicilio2','Domicílios com lixo jogado em terreno ou área pública (%)','Habitacional',[401],vs(397,402)),('alfabetizacao','Pessoas de 15 anos ou mais alfabetizadas (%)','Social',[852,854,856],vs(852,857)),('alfabetizacao','Pessoas de 15 anos ou mais não alfabetizadas (%)','Social',[853,855,857],vs(852,857)),('demografia','Moradores de 0 a 14 anos (%)','Demográfica',vs(1031,1033),vs(1031,1041)),('demografia','Moradores de 15 a 59 anos (%)','Demográfica',vs(1034,1039),vs(1031,1041)),('demografia','Moradores de 60 anos ou mais (%)','Demográfica',vs(1040,1041),vs(1031,1041))]
def key(i):return f'V{i:05}'
rows=[]; cache={}
for pattern,name,dim,num,den in specs:
 if pattern not in cache:
  p=next(base.glob(f'Agregados_por_bairros_{pattern}*.zip'))
  with zipfile.ZipFile(p) as z:
   f=next(x for x in z.namelist() if x.endswith('.csv'))
   with z.open(f) as raw:
    rr=[r for r in csv.DictReader(io.TextIOWrapper(raw,encoding='latin1'),delimiter=';') if r['CD_BAIRRO'] in codes]
   assert len(rr)==2 and {r['CD_BAIRRO'] for r in rr}==set(codes)
   cache[pattern]=(f,rr)
 f,rr=cache[pattern]
 formula='100 × ('+' + '.join(map(key,num))+') / ('+' + '.join(map(key,den))+')'
 desc='; '.join(f'{key(i)}: {d[key(i)]}' for i in num)
 for r in rr:
  n=sum(Decimal(r[key(i)]) for i in num); b=sum(Decimal(r[key(i)]) for i in den)
  assert 0<=n<=b and b>0
  if pattern=='demografia' and b!=Decimal(r['V01006']):print('Divergência demográfica',r['CD_BAIRRO'],b,r['V01006'])
  rows.append([codes[r['CD_BAIRRO']],name,desc,'%',dim,formula,'Indicador derivado','IBGE','Censo 2022 - '+f,url,'Bairro',2022,str((100*n/b).quantize(Decimal('.0001'))),'bairro',f"Código {r['CD_BAIRRO']}; numerador {n}; denominador {b}; universo das categorias publicadas; dicionário 20261113. Não imputado."])
cols='territory_slug,indicator_name,description,unit,dimension,methodology,classification,source_institution,source_title,source_url,source_scale,year,value,geographic_scale,notes'.split(',')
out.parent.mkdir(parents=True,exist_ok=True)
with out.open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(cols);w.writerows(rows)
print(len(rows),'observações')
