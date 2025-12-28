import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { embed } from 'ai'
import { searchReadings } from '@/lib/supabase/functions/readings'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the search query
    const { embedding } = await embed({
      model: 'openai/text-embedding-3-small',
      value: query
    })

    const results = await searchReadings(embedding)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
