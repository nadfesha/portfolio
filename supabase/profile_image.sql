-- Run this once in Supabase Dashboard > SQL Editor

-- 1. Key/value table for site settings (profile photo URL)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admin can manage site settings"
  on public.site_settings for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 2. Public storage bucket for the photo
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "Public can view site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Admin can upload site assets"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can delete site assets"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
