-- Somente leitura: resultado esperado 86, 40, 3.
select count(*) observacoes,count(distinct indicator_id) indicadores,count(distinct territory_id) territorios from public.observations;
select s.institution,count(*) registros,count(distinct o.indicator_id) indicadores,min(o.year) primeiro_ano,max(o.year) ultimo_ano from public.observations o join public.sources s on s.id=o.source_id group by s.institution order by s.institution;
select t.name,i.dimension,count(*) registros from public.observations o join public.territories t on t.id=o.territory_id join public.indicators i on i.id=o.indicator_id group by t.name,i.dimension order by t.name,i.dimension;
select territory_id,indicator_id,source_id,year,geographic_scale,count(*) from public.observations group by 1,2,3,4,5 having count(*)>1;
select o.id,t.name,s.institution,o.geographic_scale from public.observations o join public.territories t on t.id=o.territory_id join public.sources s on s.id=o.source_id where (s.institution in ('EPE','IPEA') and t.slug <> 'bahia') or (s.institution='IBGE' and t.slug='bahia');
