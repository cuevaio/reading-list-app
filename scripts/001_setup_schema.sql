-- Enable pgvector extension for semantic search
create extension if not exists vector with schema extensions;

-- Create readings table with vector embeddings
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  og_image text,
  favicon text,
  summary text not null,
  content text,
  embedding extensions.vector(384),
  is_read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster vector similarity search
create index on public.readings using ivfflat (embedding extensions.vector_cosine_ops);

-- Create index on user_id for faster queries
create index on public.readings(user_id);

-- Create index on is_read for faster filtering
create index on public.readings(user_id, is_read);

-- Enable Row Level Security
alter table public.readings enable row level security;

-- RLS Policies for readings table
create policy "Users can view their own readings"
  on public.readings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own readings"
  on public.readings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own readings"
  on public.readings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own readings"
  on public.readings for delete
  using (auth.uid() = user_id);

-- Create function for semantic search
create or replace function search_readings(
  query_embedding extensions.vector(384),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
returns table (
  id uuid,
  url text,
  title text,
  og_image text,
  favicon text,
  summary text,
  is_read boolean,
  created_at timestamp with time zone,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    readings.id,
    readings.url,
    readings.title,
    readings.og_image,
    readings.favicon,
    readings.summary,
    readings.is_read,
    readings.created_at,
    1 - (readings.embedding <=> query_embedding) as similarity
  from public.readings
  where readings.user_id = filter_user_id
    and 1 - (readings.embedding <=> query_embedding) > match_threshold
  order by readings.embedding <=> query_embedding
  limit match_count;
end;
$$;
