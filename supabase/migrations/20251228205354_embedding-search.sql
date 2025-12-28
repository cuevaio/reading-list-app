-- Migration: Setup embedding triggers for readings
-- This enables automatic embedding generation when readings are inserted or updated

-- Enable pg_net extension for async HTTP requests from database triggers
-- pg_net allows making HTTP requests to Edge Functions from within the database
create extension if not exists pg_net with schema extensions;

-- Grant net schema usage to postgres (needed for triggers)
grant usage on schema net to postgres;

-- Create function to call the embed-reading Edge Function
-- This function is triggered after INSERT or UPDATE on relevant columns
create or replace function public.handle_reading_embedding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  edge_function_url text;
  payload jsonb;
begin
  -- Build the Edge Function URL
  -- Uses the SUPABASE_URL from the database settings
  edge_function_url := rtrim(current_setting('app.settings.supabase_url', true), '/') || '/functions/v1/embed-reading';
  
  -- If supabase_url is not configured, try using the standard format
  if edge_function_url is null or edge_function_url = '/functions/v1/embed-reading' then
    -- Skip embedding if URL not configured
    raise notice 'Supabase URL not configured, skipping embedding for reading %', new.id;
    return new;
  end if;

  -- Skip if no content to embed
  if new.title is null and new.summary is null and new.content is null then
    return new;
  end if;

  -- For UPDATE, only re-embed if relevant content changed
  if tg_op = 'UPDATE' then
    if old.title is not distinct from new.title 
       and old.summary is not distinct from new.summary 
       and old.content is not distinct from new.content then
      -- No relevant changes, skip embedding
      return new;
    end if;
  end if;

  -- Build the payload
  payload := jsonb_build_object(
    'type', tg_op,
    'table', 'readings',
    'record', jsonb_build_object(
      'id', new.id,
      'user_id', new.user_id,
      'url', new.url,
      'title', new.title,
      'summary', new.summary,
      'content', new.content,
      'og_image', new.og_image,
      'favicon', new.favicon,
      'is_read', new.is_read,
      'created_at', new.created_at,
      'updated_at', new.updated_at
    ),
    'old_record', case 
      when tg_op = 'UPDATE' then jsonb_build_object(
        'id', old.id,
        'title', old.title,
        'summary', old.summary,
        'content', old.content
      )
      else null 
    end
  );

  -- Call the Edge Function asynchronously using pg_net
  -- This won't block the main transaction
  perform net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )::jsonb,
    body := payload::jsonb
  );

  return new;
exception
  when others then
    -- Log warning but don't fail the main transaction
    -- The embedding can be regenerated later if needed
    raise notice 'Failed to trigger embedding for reading %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_reading_embed on public.readings;

-- Create the trigger on the readings table
-- Fires after INSERT or UPDATE only when title, summary, or content changes
create trigger on_reading_embed
  after insert or update of title, summary, content
  on public.readings
  for each row
  execute function public.handle_reading_embedding();

-- Add comment for documentation
comment on function public.handle_reading_embedding() is 
  'Triggers the embed-reading Edge Function to generate embeddings when reading content changes. 
   Requires app.settings.supabase_url and app.settings.service_role_key to be configured.';

comment on trigger on_reading_embed on public.readings is 
  'Calls embed-reading Edge Function when title, summary, or content is inserted or updated.';
