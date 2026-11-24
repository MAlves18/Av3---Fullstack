import { supabase, supabaseConfigured } from './supabase'

export async function loadDashboard({ territoryId = 'all', year = 'all' } = {}) {
  if (!supabaseConfigured) return { observations: [], territories: [], sources: [], configured: false }

  const yearQuery = supabase.from('observations').select('year').order('year', { ascending: false })
  let territoryQuery = supabase.from('territories').select('*').order('name')
  let sourceQuery = supabase.from('sources').select('*').order('institution')
  let observationQuery = supabase
    .from('observations')
    .select(`id, year, value, classification, geographic_scale, notes, territories(id,name,slug), indicators(id,name,unit,dimension,description,methodology), sources(id,institution,title,geographic_scale,url,access_date,notes)`)
    .order('year', { ascending: false })

  if (territoryId !== 'all') observationQuery = observationQuery.eq('territory_id', territoryId)
  if (year !== 'all') observationQuery = observationQuery.eq('year', Number(year))

  const [t, s, o, y] = await Promise.all([territoryQuery, sourceQuery, observationQuery, yearQuery])
  const error = t.error || s.error || o.error || y.error
  if (error) throw error
  return { territories: t.data || [], sources: s.data || [], observations: o.data || [], configured: true, territoryId, years: uniqueYears(y.data || []) }
}

export function uniqueYears(observations) {
  return [...new Set(observations.map(x => x.year))].sort((a,b) => b-a)
}

export function latestValue(observations, indicatorName, territoryName) {
  const found = observations
    .filter(o => o.indicators?.name === indicatorName && (!territoryName || o.territories?.name === territoryName))
    .sort((a,b) => b.year-a.year)[0]
  return found || null
}

export function asNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
