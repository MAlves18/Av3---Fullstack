# Observatório de Vulnerabilidade Socioenergética de Salvador

Projeto integrador da AV3 - Desenvolvimento Fullstack. O sistema organiza indicadores públicos para caracterizar e comparar Beiru/Tancredo Neves e Pernambués, sem confundir dados estaduais com dados de bairro.

## Tecnologias

- React + Vite
- Supabase / PostgreSQL
- Recharts (gráficos)
- Leaflet + OpenStreetMap (mapa)
- Python + Pandas + SQLAlchemy (ETL)
- GitHub + Vercel (versionamento e deploy)

## Requisitos

Node.js 20+ e npm. Para o ETL, Python 3.10+.

## 1. Banco Supabase

1. Crie um projeto no Supabase.
2. Abra SQL Editor.
3. Execute todo o conteúdo de `supabase/schema.sql`.
4. O script cria as tabelas `territories`, `sources`, `indicators` e `observations`, além de cadastrar os dois territórios e as fontes de referência.
5. Acesse Project Settings → API e copie Project URL e anon/public key.

## 2. Frontend

```bash
npm install
cp .env.example .env
```

No Windows PowerShell, use `Copy-Item .env.example .env`.

Preencha `.env`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

Inicie:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

Sem credenciais, a interface abre em modo de configuração e não inventa dados.

## 3. Inserção de dados oficiais

Consulte as fontes listadas no roteiro:

- IBGE - Agregados por bairros / Censo 2022: https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/
- IBGE - Censo Demográfico 2022: https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html
- IPEA - Atlas da Vulnerabilidade Social: http://ivs.ipea.gov.br/
- EPE - Anuário Estatístico de Energia Elétrica: https://www.epe.gov.br/pt/publicacoes-dados-abertos/dados-abertos/dados-do-anuario-estatistico-de-energia-eletrica

O ETL em `etl/` importa um CSV previamente normalizado. Confira a documentação e a granularidade original antes de transformar arquivos do IBGE/IPEA/EPE. O arquivo `etl/dados_normalizados.example.csv` documenta o formato aceito.

## 4. Mapa

O mapa-base funciona com OpenStreetMap. Para desenhar os limites temáticos, substitua `public/data/territorios.geojson` por GeoJSON oficial dos bairros ou setores censitários. Não use geometrias aproximadas como se fossem limites oficiais. Registre fonte, ano e escala.

## 5. Deploy na Vercel

1. Envie o projeto ao GitHub.
2. Na Vercel, importe o repositório.
3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em Environment Variables.
4. Build command: `npm run build`; output directory: `dist`.
5. Faça deploy e teste os filtros, consultas e páginas.

## Segurança

A chave `anon/public` pode estar no frontend quando as políticas RLS estão configuradas corretamente. Nunca coloque `service_role`, senha do banco ou `DATABASE_URL` no frontend, GitHub ou variáveis `VITE_*`. Use credenciais privilegiadas apenas em ambiente ETL protegido.

## Indicadores e interpretação

O sistema classifica cada observação como `Dado observado`, `Indicador derivado` ou `Proxy/estimativa`. Documente fórmulas, pesos e limitações. Baixa renda não comprova pobreza energética familiar; iluminação pública não mede continuidade/qualidade do fornecimento residencial. Indicadores da Bahia não devem ser atribuídos aos bairros.

## Limitações desta entrega-base

- O projeto contém a aplicação, estrutura SQL e pipeline de importação, mas não contém valores estatísticos inventados.
- A equipe ainda precisa baixar e validar os arquivos oficiais, normalizar os dados e importá-los.
- Os limites territoriais oficiais precisam ser adicionados em GeoJSON.
- A interpretação final deve ser escrita após conferir os dados e suas escalas.

## Versão 6.0 — consolidação

Banco existente: não execute novas cargas se os 86 registros já foram validados. Em banco novo, execute schema.sql e as cargas corrigida IBGE, IPEA/EPE, habitacao v3 e v5 nessa ordem. Valide com supabase/validar_v6.sql. As cargas preservam a separação estadual/local. O GeoJSON oficial recebido está incluído.

- `python etl/validar_consolidado.py`: consolida e valida os quatro CSVs (não exige URI).
- `docs/catalogo-indicadores.md`: 40 indicadores com fontes, fórmulas, escalas e anos.
- `docs/entrega-v6.md`: testes, GitHub e Vercel.
- `docs/qualidade-v5.md` e `docs/analise-v5.md`: limitações e oito respostas.
- V6 usa importação dinâmica por página e filtros de fonte/dimensão. Testar novo build antes do deploy. O importador genérico antigo não é a rota recomendada para a carga estadual; use os SQLs específicos.
