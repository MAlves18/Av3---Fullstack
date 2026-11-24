import os
import sys
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

REQUIRED = [
    "territory_slug","indicator_name","description","unit","dimension","methodology",
    "classification","source_institution","source_title","source_url","source_scale",
    "year","value","geographic_scale","notes"
]
VALID_CLASS = {"Dado observado", "Indicador derivado", "Proxy/estimativa"}

def required_env():
    load_dotenv()
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("Configure DATABASE_URL no arquivo .env do diretório etl.")
    return url

def main(path):
    df = pd.read_csv(path, dtype={"territory_slug":"string"}, keep_default_na=False)
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise ValueError(f"Colunas ausentes: {', '.join(missing)}")
    if df.empty:
        raise ValueError("CSV sem registros.")
    for col in ["indicator_name","unit","dimension","classification","source_institution","source_title","geographic_scale"]:
        if (df[col].astype(str).str.strip() == "").any():
            raise ValueError(f"Há valores vazios na coluna obrigatória: {col}")
    invalid = set(df["classification"]) - VALID_CLASS
    if invalid:
        raise ValueError(f"Classificações inválidas: {invalid}")
    df["year"] = pd.to_numeric(df["year"], errors="raise").astype(int)
    df["value"] = pd.to_numeric(df["value"], errors="raise")
    if not df["year"].between(1900, 2100).all():
        raise ValueError("Ano fora do intervalo permitido (1900-2100).")
    # Evita atribuir dado estadual a um bairro.
    state_rows = df["geographic_scale"].str.lower().isin(["estadual", "bahia", "estado"])
    if (state_rows & (df["territory_slug"].str.strip() != "")).any():
        raise ValueError("Registro estadual não pode possuir territory_slug.")
    engine = create_engine(required_env())
    inserted = 0
    with engine.begin() as conn:
        for _, row in df.iterrows():
            territory_id = None
            slug = str(row["territory_slug"]).strip()
            if slug:
                territory_id = conn.execute(
                    text("select id from public.territories where slug=:slug"), {"slug":slug}
                ).scalar()
                if not territory_id:
                    raise ValueError(f"Território não cadastrado: {slug}")
            source_id = conn.execute(text("""
                insert into public.sources(institution,title,url,geographic_scale,notes)
                values(:institution,:title,:url,:scale,:notes)
                on conflict do nothing returning id
            """), {
                "institution":row["source_institution"], "title":row["source_title"],
                "url":row["source_url"] or None, "scale":row["source_scale"],
                "notes":f"Importado pelo ETL. {row['notes']}"
            }).scalar()
            if not source_id:
                source_id = conn.execute(text("""
                    select id from public.sources where institution=:institution and title=:title limit 1
                """), {"institution":row["source_institution"],"title":row["source_title"]}).scalar()
            indicator_id = conn.execute(text("""
                insert into public.indicators(name,description,unit,dimension,methodology,classification)
                values(:name,:description,:unit,:dimension,:methodology,:classification)
                on conflict(name) do update set
                  description=excluded.description, unit=excluded.unit, dimension=excluded.dimension,
                  methodology=excluded.methodology, classification=excluded.classification
                returning id
            """), {
                "name":row["indicator_name"],"description":row["description"],"unit":row["unit"],
                "dimension":row["dimension"],"methodology":row["methodology"],
                "classification":row["classification"]
            }).scalar_one()
            conn.execute(text("""
                insert into public.observations
                  (territory_id,indicator_id,source_id,year,value,classification,geographic_scale,notes)
                values(:territory,:indicator,:source,:year,:value,:classification,:scale,:notes)
                on conflict (territory_id,indicator_id,source_id,year,geographic_scale)
                do update set value=excluded.value, classification=excluded.classification, notes=excluded.notes
            """), {
                "territory":territory_id,"indicator":indicator_id,"source":source_id,
                "year":int(row["year"]),"value":float(row["value"]),
                "classification":row["classification"],"scale":row["geographic_scale"],
                "notes":row["notes"]
            })
            inserted += 1
    print(f"Importação concluída: {inserted} registros processados.")
    print("Valide amostras, unidades, escalas geográficas e anos contra as fontes originais.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python import_data.py dados_normalizados.csv")
        raise SystemExit(2)
    main(sys.argv[1])
