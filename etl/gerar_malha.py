"""Converte a malha oficial IBGE em GeoJSON, sem simplificar limites."""
import argparse, json, tempfile, zipfile
from pathlib import Path
import geopandas as gpd
CODES={'2927408018':'beiru-tancredo-neves','2927408117':'pernambues'}
URL='https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/shp/UF/BA/BA_bairros_CD2022.zip'
p=argparse.ArgumentParser();p.add_argument('arquivo',type=Path);p.add_argument('--saida',type=Path,default=Path(__file__).resolve().parents[1]/'public/data/territorios.geojson');a=p.parse_args()
with tempfile.TemporaryDirectory() as tmp:
    if a.arquivo.suffix.lower()=='.zip':
        with zipfile.ZipFile(a.arquivo) as z:
            for n in z.namelist():
                if not Path(tmp,n).resolve().is_relative_to(Path(tmp).resolve()): raise ValueError('ZIP inseguro')
            z.extractall(tmp)
        files=list(Path(tmp).rglob('*.shp'))
        if len(files)!=1: raise ValueError(f'Esperado um shapefile, encontrados {len(files)}')
        g=gpd.read_file(files[0])
    else: g=gpd.read_file(a.arquivo)
    if 'CD_BAIRRO' not in g or g.crs is None: raise ValueError('Código IBGE ou CRS ausente')
    g['CD_BAIRRO']=g['CD_BAIRRO'].astype(str).str.strip()
    g=g[g.CD_BAIRRO.isin(CODES)].copy()
    if set(g.CD_BAIRRO)!=set(CODES) or len(g)!=2: raise ValueError('Não foram encontrados exatamente os dois códigos de bairro')
    if 'NM_BAIRRO' not in g: raise ValueError('Nome oficial do bairro ausente')
    print(g[['CD_BAIRRO','NM_BAIRRO']].to_string(index=False))
    if g.geometry.is_empty.any() or g.geometry.isna().any() or not g.geometry.is_valid.all() or not g.geom_type.isin(['Polygon','MultiPolygon']).all(): raise ValueError('Geometrias inválidas; verificar a fonte')
    g=g.to_crs(4326);g['slug']=g.CD_BAIRRO.map(CODES)
    out=json.loads(g[['CD_BAIRRO','NM_BAIRRO','slug','geometry']].to_json(drop_id=True));out['metadata']={'source':'IBGE, Censo 2022, malha de bairros','url':URL,'year':2022,'crs':'EPSG:4326'}
    a.saida.parent.mkdir(parents=True,exist_ok=True);a.saida.write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8');print(a.saida)
