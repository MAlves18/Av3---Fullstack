# ETL - Importação de indicadores

O roteiro exige scripts reproduzíveis, validação de códigos, tratamento de ausências e relatório de qualidade. Este ETL recebe um CSV já extraído de uma fonte oficial e normalizado para o formato abaixo. A equipe deve conferir o dicionário da base original antes de mapear colunas: este projeto não presume que nomes/códigos dos arquivos oficiais sejam idênticos.

## Formato `dados_normalizados.csv`

Colunas obrigatórias:
- `territory_slug`: `beiru-tancredo-neves`, `pernambues` ou vazio para registro estadual.
- `indicator_name`, `description`, `unit`, `dimension`, `methodology`.
- `classification`: `Dado observado`, `Indicador derivado` ou `Proxy/estimativa`.
- `source_institution`, `source_title`, `source_url`, `source_scale`.
- `year`, `value`, `geographic_scale`, `notes`.

Para dados estaduais da EPE, deixe `territory_slug` vazio e use `geographic_scale=estadual`. Não atribua esse dado aos bairros.

## Execução

1. Crie o banco executando `supabase/schema.sql`.
2. Instale dependências: `pip install -r requirements.txt`.
3. Copie `.env.example` para `.env` e configure `DATABASE_URL`.
4. Prepare `dados_normalizados.csv` conforme o modelo `dados_normalizados.example.csv`.
5. Execute `python import_data.py dados_normalizados.csv`.

O script valida campos, classificação, anos, valores numéricos e referências antes da carga. Faça backup antes de importar novamente.
