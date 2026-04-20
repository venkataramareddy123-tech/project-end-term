export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    '',
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN?.trim() ?? '',
}

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
export const isMapboxConfigured = Boolean(env.mapboxToken)
export const appModeLabel = isSupabaseConfigured ? 'Supabase' : 'Demo Mode'
