# Entrega AV3 — roteiro de verificação

## Evidências existentes
V5: SQL, build e preview confirmados pelo aluno. V4: polígonos exibidos. V6 ainda requer novo build e teste. O arquivo GeoJSON recebido contém os códigos 2927408018 e 2927408117. Não foi necessário alterar o banco.

## Qualidade
O teste `python etl/validar_consolidado.py` verifica os quatro CSVs, unicidade da chave, finitude, percentuais, escala e presença de fórmula e URL. Não substitui a revisão das definições originais. Consulte `qualidade-v5.md` para divergências de universos. A extração inicial do IBGE e das planilhas IPEA/EPE não está integralmente automatizada neste pacote; os CSVs e scripts SQL permitem reproduzir a carga, não toda a extração. Datas de acesso ausentes não foram inventadas.

## Testes de aceitação
- npm ci; npm run build; npm run preview.
- Abrir as cinco telas, testar território, ano, fonte e dimensão.
- Conferir 33 indicadores locais por bairro e 20 observações estaduais; testar tooltip, legenda, popup e todos os filtros.
- Executar supabase/validar_v6.sql. Conferir 86 observações, 40 indicadores, 3 territórios; as duas últimas consultas não devem retornar linhas.
- Conferir layout mobile, atualização e erros de rede.
- Após deploy, repetir os testes na URL pública.

## Git e Vercel
Criar repositório vazio no GitHub. Nunca incluir .env ou credenciais do ETL. Conferir `git status` antes do commit. Criar main, develop e feature/*, registrar contribuições reais e usar pull requests. Na Vercel importar o repositório, framework Vite, build npm run build, saída dist; configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (publishable). Fazer deploy e registrar URL e evidências. Não inventar commits, autores ou testes.

## Relatório e apresentação
Usar catálogo-indicadores.md (arquivo `catalogo-indicadores.md`), qualidade-v5.md, analise-v5.md e roteiro-apresentacao.md. Apresentar a pergunta norteadora, pipeline, três fontes obrigatórias, cinco telas, resultados e limites; demonstrar GitHub e Vercel. IEVS opcional, não implementado.
