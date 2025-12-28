import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { embed } from "ai"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query } = await request.json()

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Generate embedding for the search query
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: query,
    })

    // Use the search_readings function we created in the database
    const { data, error } = await supabase.rpc("search_readings", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: 0.5, // Similarity threshold (0-1, higher = more similar)
      match_count: 20, // Maximum number of results
      filter_user_id: user.id,
    })

    if (error) {
      console.error("Search error:", error)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    return NextResponse.json({ results: data || [] })
  } catch (error) {
    console.error("Semantic search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
