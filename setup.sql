-- While Your Out: run this once in Supabase -> SQL Editor -> New query -> Run

create table if not exists public.items (
  id         bigint generated always as identity primary key,
  name       text        not null,
  done       boolean     not null default false,
  created_at timestamptz not null default now()
);

-- Anyone with the link can read/add/check off/delete (no login).
alter table public.items enable row level security;

drop policy if exists "anyone with link" on public.items;
create policy "anyone with link" on public.items
  for all to anon, authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.items to anon, authenticated;

-- Live updates: when you add something, it shows up on her phone right away.
alter publication supabase_realtime add table public.items;
