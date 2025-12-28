import { createClient } from '../server'

export const searchReadings = async (vector: number[]) => {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase.rpc('search_readings', {
    query_embedding: JSON.stringify(vector),
    match_threshold: 0.5,
    match_count: 5,
    filter_user_id: user.id
  })

  if (error) {
    console.error(`[Supabase] Error searching restaurants:`, error)
  }

  return data
}
