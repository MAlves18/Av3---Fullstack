# Mapa temático v4
Fonte oficial: https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html (link 2 do roteiro).
Baixe a malha de bairros BA: https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/shp/UF/BA/BA_bairros_CD2022.zip
Na raiz do projeto:
```
python -m pip install geopandas
python etl/gerar_malha.py BA_bairros_CD2022.zip
npm run dev
```
Confira os nomes oficiais impressos e os códigos 2927408018 e 2927408117 antes de publicar. O conversor preserva os limites, reprojeta para EPSG:4326 e gera public/data/territorios.geojson. Não foi possível baixar a malha no ambiente de geração; o pacote não contém polígonos reais. O mapa funciona após a conversão. Cores relativas à magnitude dos valores, sem índice de risco. Dados estaduais não são exibidos. Não é necessário executar migração de banco.
