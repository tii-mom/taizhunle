-- -----------------------------------------------------------------------------
-- Adds tags & reference URL metadata to markets table
-- -----------------------------------------------------------------------------

alter table if exists public.predictions
  add column if not exists tags text[] default '{}'::text[];

alter table if exists public.predictions
  add column if not exists reference_url text;
