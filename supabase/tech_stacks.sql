-- Run this once in Supabase Dashboard > SQL Editor
-- (Needs the 'site-assets' bucket from profile_image.sql for logo uploads)

create table if not exists public.tech_stacks (
  id bigint generated always as identity primary key,
  name text not null,
  icon text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.tech_stacks enable row level security;

create policy "Public can read tech stacks"
  on public.tech_stacks for select
  using (true);

create policy "Admin can manage tech stacks"
  on public.tech_stacks for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Existing tech stack (logos from the /public folder)
insert into public.tech_stacks (name, icon, sort_order) values
  ('HTML', '/html.svg', 1),
  ('CSS', '/css.svg', 2),
  ('JavaScript', '/javascript.svg', 3),
  ('PHP', '/php.png', 4),
  ('ReactJS', '/reactjs.svg', 5),
  ('Laravel', '/laravel.png', 6),
  ('Bootstrap', '/bootstrap.svg', 7),
  ('Python', '/python.png', 8),
  ('Supabase', '/supabase.png', 9),
  ('Vite', '/vite.svg', 10),
  ('Git & GitHub', '/github.png', 11),
  ('Docker', '/docker.png', 12);
