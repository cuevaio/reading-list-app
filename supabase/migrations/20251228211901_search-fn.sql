-- Migration: Improved semantic search function for readings
-- This function performs vector similarity search using cosine distance
-- Expects 384-dimensional embeddings (compatible with models like all-MiniLM-L6-v2 or text-embedding-3-small@384)

-- Drop existing function if it exists (to allow recreation with improved version)
drop function if exists public.search_readings_by_embedding;

-- Create improved semantic search function
-- This function searches readings by embedding similarity
create or replace function public.search_readings_by_embedding(
  query_embedding text,           -- JSON array string of the embedding vector (384 dimensions)
  match_threshold float default 0.5, -- Minimum similarity threshold (0-1, higher = more similar)
  match_count int default 20,        -- Maximum number of results to return
  filter_user_id uuid default null   -- Optional: filter by user_id (null = all users the caller can access)
)
returns table (
  id uuid,
  url text,
  title text,
  og_image text,
  favicon text,
  summary text,
  content text,
  is_read boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
language plpgsql
security invoker -- Respects RLS policies
as $$
declare
  embedding_vector extensions.vector(384);
begin
  -- Parse the JSON array string into a vector
  embedding_vector := query_embedding::extensions.vector(384);
  
  return query
  select
    r.id,
    r.url,
    r.title,
    r.og_image,
    r.favicon,
    r.summary,
    r.content,
    r.is_read,
    r.created_at,
    r.updated_at,
    (1 - (r.embedding <=> embedding_vector))::float as similarity
  from public.readings r
  where 
    -- Apply user filter if provided, otherwise rely on RLS
    (filter_user_id is null or r.user_id = filter_user_id)
    -- Only include rows that have embeddings
    and r.embedding is not null
    -- Apply similarity threshold using cosine distance
    and (1 - (r.embedding <=> embedding_vector)) > match_threshold
  order by r.embedding <=> embedding_vector
  limit match_count;
end;
$$;

-- Add comment for documentation
comment on function public.search_readings_by_embedding is 
  'Performs semantic search on readings using vector similarity.
   Accepts a 384-dimensional embedding as a JSON array string.
   Returns readings sorted by similarity score (highest first).
   Respects RLS policies for security.';

-- Grant execute permission to authenticated users
grant execute on function public.search_readings_by_embedding to authenticated;
